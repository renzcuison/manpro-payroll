<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\TrainingsModel;
use App\Models\TrainingContentModel;
use App\Models\TrainingViewsModel;
use App\Models\TrainingFormsModel;
use App\Models\TrainingFormItemsModel;
use App\Models\TrainingFormChoicesModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\MediaCollections\Models\Media;


use Carbon\Carbon;

class TrainingsController extends Controller
{
    public function checkUser()
    {
        // Log::info("TrainingController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    // Training List ---------------------------------------------------------------- /
    public function getTrainings()
    {
        //Log::info("TrainingsController::getTrainings");
        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                $trainings = TrainingsModel::where('client_id', $user->client_id)
                    ->with(['contents' => function ($query) {
                        $query->with('media');
                    }])
                    ->get()
                    ->map(function ($training) {
                        $hasVideo = $training->contents->contains(function ($content) {
                            return $content->source && !$content->training_form_id && $content->media->isEmpty();
                        });
                        $hasImage = $training->contents->contains(function ($content) {
                            return $content->media->contains(function ($media) {
                                return $media->collection_name === 'images' && $media->getCustomProperty('type') === 'Image';
                            });
                        });
                        $hasAttachment = $training->contents->contains(function ($content) {
                            return $content->media->contains(function ($media) {
                                return in_array($media->collection_name, ['documents', 'powerpoints']) &&
                                    in_array($media->getCustomProperty('type'), ['Document', 'PowerPoint']);
                            });
                        });
                        $hasForm = $training->contents->contains('training_form_id');

                        // Content Flags
                        $training->video = $hasVideo;
                        $training->image = $hasImage;
                        $training->attachment = $hasAttachment;
                        $training->form = $hasForm;

                        // Clean Up
                        unset($training->contents);

                        return $training;
                    });

                return response()->json(['status' => 200, 'trainings' => $trainings]);
            } catch (\Exception $e) {
                Log::error("Error retrieving trainings: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error retrieving trainings'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function getEmployeeTrainings()
    {
        //Log::info("TrainingsController::getEmployeeTrainings");
        $user = Auth::user();

        try {
            $trainings = TrainingsModel::where('client_id', $user->client_id)
                ->where('status', 'Active')
                ->where('start_date', "<=", Carbon::now())
                ->where('end_date', ">=", Carbon::now())
                ->with(['contents' => function ($query) {
                    $query->with(['media', 'views']);
                }])
                ->get()
                ->map(function ($training) use ($user) {
                    $totalContents = $training->contents->count();

                    // View trackers
                    $hasViews = $training->contents->contains(function ($content) use ($user) {
                        return $content->views->contains('user_id', $user->id);
                    });
                    $completedContents = $training->contents->filter(function ($content) use ($user) {
                        return $content->views->contains(function ($view) use ($user) {
                            return $view->user_id === $user->id && $view->status === 'Finished';
                        });
                    })->count();

                    // Content types
                    $hasVideo = $training->contents->contains(function ($content) {
                        return $content->source && !$content->training_form_id && $content->media->isEmpty();
                    });
                    $hasImage = $training->contents->contains(function ($content) {
                        return $content->media->contains(function ($media) {
                            return $media->collection_name === 'images' && $media->getCustomProperty('type') === 'Image';
                        });
                    });
                    $hasAttachment = $training->contents->contains(function ($content) {
                        return $content->media->contains(function ($media) {
                            return in_array($media->collection_name, ['documents', 'powerpoints']) &&
                                in_array($media->getCustomProperty('type'), ['Document', 'PowerPoint']);
                        });
                    });
                    $hasForm = $training->contents->contains('training_form_id');

                    // Set flags
                    $training->video = $hasVideo;
                    $training->image = $hasImage;
                    $training->attachment = $hasAttachment;
                    $training->form = $hasForm;
                    $training->completed = $totalContents == $completedContents;
                    $training->viewed = $hasViews;

                    // Clean up
                    unset($training->contents);

                    return $training;
                });

            return response()->json(['status' => 200, 'trainings' => $trainings]);
        } catch (\Exception $e) {
            Log::error("Error retrieving trainings: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error retrieving trainings'], 500);
        }
    }

    // Training CRUD ---------------------------------------------------------------- /
    public function saveTraining(Request $request)
    {
        //Log::info("TrainingsController::saveTraining");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $uniqueCode = $this->generateRandomCode(16);
                while (TrainingsModel::where('unique_code', $uniqueCode)->exists()) {
                    $uniqueCode = $this->generateRandomCode(16);
                }

                $training = TrainingsModel::create([
                    'unique_code' => $uniqueCode,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'start_date' => $request->input('start_date'),
                    'end_date' => $request->input('end_date'),
                    'duration' => $request->input('duration'),
                    'client_id' => $user->client_id,
                    'created_by' => $user->id,
                ]);

                if ($request->hasFile('cover_image')) {
                    $training->addMedia($request->file('cover_image'))
                        ->toMediaCollection('covers');
                }

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function editTraining(Request $request)
    {
        //Log::info("TrainingsController::editTraining");
        //Log::info($request);

        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $request->input('unique_code'))->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            try {
                DB::beginTransaction();

                $training->title = $request->input('title');
                $training->description = $request->input('description');
                $training->start_date = $request->input('start_date');
                $training->end_date = $request->input('end_date');
                $training->duration = $request->input('duration');

                if ($request->hasFile('cover_image')) {
                    $training->addMedia($request->file('cover_image'))
                        ->toMediaCollection('covers');
                }
                $training->save();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating: " . $e->getMessage());

                return response()->json(['status' => 500, 'message' => 'Failed to update training: ' . $e->getMessage()], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function updateTrainingStatus(Request $request)
    {
        //Log::info("TrainingsController::editTraining");
        //Log::info($request);

        $user = Auth::user();
        $training = TrainingsModel::where('unique_code', $request->input('code'))->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            try {
                DB::beginTransaction();

                $training->status = $request->input('status');
                $training->save();

                DB::commit();

                return response()->json(['status' => 200, 'message' => "Training status updated successfully"]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Content CRUD ----------------------------------------------------------------- /
    public function saveContent(Request $request)
    {
        //Log::info("TrainingsController::saveContent");
        //Log::info($request);

        $user = Auth::user();
        $training = TrainingsModel::where('unique_code', $request->input('unique_code'))
            ->select('id', 'client_id')
            ->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            $contentCount = TrainingContentModel::where('training_id', $training->id)->count();
            $nextOrder = $contentCount + 1;

            try {
                DB::beginTransaction();
                $contentType = $request->input('content_type');

                $trainingFormId = null;
                $source = null;

                // Video Processing
                if ($contentType == 'Video') {
                    $source = $request->input('link');
                    if (!$source) {
                        return response()->json(['status' => 400, 'message' => 'Video link is required'], 400);
                    }
                }
                // Form Processing
                if ($contentType == 'Form') {
                    $contentData = TrainingFormsModel::create([
                        'require_pass' => $request->input('attempt_policy') == "passing-required",
                        'passing_score' => $request->input('passing_score'),
                        'attempts_allowed' => $request->input('attempt_policy') == "limited-attempts" ? $request->input('attempts') : null,
                    ]);
                    $trainingFormId = $contentData->id;
                }

                $content = TrainingContentModel::create([
                    'training_id' => $training->id,
                    'training_form_id' => $trainingFormId,
                    'order' => $nextOrder,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'duration' => $request->input('duration'),
                    'source' => $source,
                ]);

                switch ($contentType) {
                    case 'Video':
                    case 'Form':
                        Log::info('entry already added with necessary content, no further processing needed.');
                        break;
                    case 'Image':
                    case 'Document':
                    case 'PowerPoint':
                        if ($request->hasFile('file')) {
                            $collection = strtolower($contentType) . 's';
                            $content->addMedia($request->file('file'))
                                ->withCustomProperties(['type' => $contentType])
                                ->toMediaCollection($collection);
                        } else {
                            return response()->json(['status' => 400, 'message' => 'File is required'], 400);
                        }
                        break;
                    default:
                        return response()->json(['status' => 400, 'message' => 'Invalid content type'], 400);
                }

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content Saved Successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::info($e);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function editContent(Request $request)
    {
        //Log::info("TrainingsController::editContent");
        //Log::info($request);

        $user = Auth::user();
        $content = TrainingContentModel::with('training')->find($request->input('id'));
        $clientId = $content->training->client_id;

        if (!$content) {
            return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
        }

        if ($this->checkUser() && $user->client_id == $clientId) {
            try {
                DB::beginTransaction();

                $content->title = $request->input('title', $content->title);
                $content->description = $request->input('description', $content->description);
                $content->order = $request->input('order', $content->order);
                $content->duration = $request->input('duration');

                $relatedContent = null;
                $contentType = null;

                $collections = ['images', 'documents', 'powerpoints'];
                foreach ($collections as $collection) {
                    $media = $content->getFirstMedia($collection);
                    if ($media) {
                        $relatedContent = $media;
                        $contentType = $media->getCustomProperty('type');
                        break;
                    }
                }
                if (!$contentType && $content->training_form_id) {
                    $relatedContent = $content->form;
                    $contentType = 'Form';
                }

                if (!$contentType && $content->source) {
                    $relatedContent = $content->source;
                    $contentType = 'Video';
                }

                if (!$relatedContent) {
                    return response()->json(['status' => 400, 'message' => 'Related content not found'], 400);
                }

                switch ($contentType) {
                    case 'Video':
                        $newSource = $request->input('link');
                        if ($newSource && $newSource != $relatedContent) {
                            $content->source = $newSource;
                        }
                        break;
                    case 'Image':
                    case 'Document':
                    case 'PowerPoint':
                        if ($request->hasFile('file') && $request->input('newFile') == "true") {
                            $collection = strtolower($contentType) . 's';
                            $content->addMedia($request->file('file'))
                                ->withCustomProperties(['type' => $contentType])
                                ->toMediaCollection($collection);
                        }
                        break;
                    case 'Form':
                        $relatedContent->require_pass = $request->input('attempt_policy') == 'passing-required';
                        $relatedContent->attempts_allowed = $request->input('attempts');
                        $relatedContent->passing_score = $request->input('passing_score');
                        $relatedContent->save();
                        break;
                    default:
                        return response()->json(['status' => 400, 'message' => 'Invalid content type'], 400);
                }

                $content->save();

                DB::commit();
                return response()->json(['status' => 200, 'message' => 'Content Updated Successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function removeContent(Request $request)
    {
        // Log::info("TrainingsController::removeContent");
        // Log::info($request);

        $user = Auth::user();
        $content = TrainingContentModel::with('training')->find($request->input('id'));

        if (!$content) {
            return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
        }

        $clientId = $content->training->client_id;

        if ($this->checkUser() && $user->client_id == $clientId) {
            try {
                DB::beginTransaction();

                $deletedOrder = $content->order;
                $trainingId = $content->training_id;

                // File Clearing
                $collections = ['images', 'documents', 'powerpoints'];
                foreach ($collections as $collection) {
                    $content->clearMediaCollection($collection);
                }

                // Form Deletes
                if ($content->training_form_id) {
                    $formId = $content->training_form_id;

                    TrainingFormChoicesModel::whereIn('form_item_id', function ($query) use ($formId) {
                        $query->select('id')
                            ->from('training_form_items')
                            ->where('form_id', $formId);
                    })->delete();
                    TrainingFormItemsModel::where('form_id', $formId)->delete();

                    // Form SoftDeletes, Pending addition to Database
                    // $form = TrainingFormsModel::find($formId);
                    // $form->delete();
                }

                $content->order = null;
                $content->save();
                $content->delete();

                // Content Reorder
                TrainingContentModel::where('order', '>', $deletedOrder)
                    ->where('training_id', $trainingId)
                    ->decrement('order', 1);

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content removed successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error removing content ID {$request->input('id')}: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error removing content'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function saveContentSettings(Request $request)
    {
        //Log::info("TrainingsController::saveContentSettings");
        //Log::info($request);

        $user = Auth::user();
        $order = $request->input('new_order');

        $training = TrainingsModel::where('unique_code', $request->input('unique_code'))
            ->with('contents')
            ->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            try {
                DB::beginTransaction();

                $training->sequential = $request->input('in_order');
                $training->save();

                $orderMap = [];
                foreach ($order as $ord) {
                    $orderMap[$ord['id']] = $ord['order'];
                }

                $training->contents()->update([
                    'order' => DB::raw("CASE id " . implode(' ', array_map(function ($id) use ($orderMap) {
                        return "WHEN $id THEN " . $orderMap[$id];
                    }, array_keys($orderMap))) . " END")
                ]);

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content order updated successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error updating content order: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error updating content order'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Training, Content Details ---------------------------------------------------- /
    public function getTrainingDetails($code)
    {
        //Log::info("TrainingsController::getTrainingDetails");
        //Log::info($code);

        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
            ->with('user')
            ->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            $author = $training->user;

            $training->author_name = implode(' ', array_filter([
                $author->first_name ?? null,
                $author->middle_name ?? null,
                $author->last_name ?? null,
                $author->suffix ?? null
            ]));
            $training->author_title = $author->jobTitle->name;

            $training->cover = null;
            $training->cover_name = null;
            $media = $training->getFirstMedia('covers');
            if ($media) {
                $training->cover = base64_encode(file_get_contents($media->getPath()));
                $training->cover_name = $media->file_name;
            }

            $trainingData = $training->toArray();
            unset($trainingData['user']);

            return response()->json(['status' => 200, 'training' => $trainingData]);
        } else {
            return response()->json(['status' => 200, 'training' => null]);
        }
    }

    public function getTrainingContent($code)
    {
        //Log::info("TrainingsController::getTrainingContent");
        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
            ->select('id', 'client_id')
            ->firstOrFail();

        if ($this->checkUser() && $training->client_id == $user->client_id) {
            $content = TrainingContentModel::with(['form'])
                ->where('training_id', $training->id)
                ->orderBy('order', 'asc')
                ->get()
                ->map(function ($cont) {
                    $cont->content = null;
                    $cont->empty_form = false;
                    $cont->image = null;
                    $cont->mime = null;

                    // Media Retrieval
                    $collections = ['images', 'documents', 'powerpoints'];
                    foreach ($collections as $collection) {
                        $media = $cont->getFirstMedia($collection);
                        if ($media) {
                            $cont->content = (object) [
                                'type' => $media->getCustomProperty('type'),
                                'source' => $media->getUrl(),
                            ];
                            if ($media->getCustomProperty('type') === 'Image') {
                                $cont->image = base64_encode(file_get_contents($media->getPath()));
                                $cont->mime = $media->mime_type;
                            }
                            break;
                        }
                    }

                    // Form, Video Check
                    if (!$cont->content) {
                        if ($cont->training_form_id) {
                            $formData = $cont->form;
                            $cont->content = $formData;
                            $cont->empty_form = $formData->items->count() == 0;
                        } elseif ($cont->source) {
                            $cont->content = (object) ['type' => 'Video', 'source' => $cont->source];
                        }
                    }

                    unset($cont->form);
                    return $cont;
                });

            return response()->json(['status' => 200, 'content' => $content]);
        } else {
            return response()->json(['status' => 200, 'content' => null]);
        }
    }

    public function getContentDetails($id)
    {
        // Log::info("TrainingsController::getContentDetails");
        $user = Auth::user();

        if ($this->checkUser()) {
            $content = TrainingContentModel::with(['form', 'views'])->find($id);

            if (!$content) {
                return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
            }

            // View Statistics
            $content->view_count = $content->views->where('status', 'Viewed')->count();
            $content->finished_count = $content->views->where('status', 'Finished')->count();

            $viewedUserIds = $content->views->pluck('user_id')->toArray();
            $content->no_view_count = UsersModel::where('client_id', $user->client_id)
                ->where('user_type', 'Employee')
                ->whereNotIn('id', $viewedUserIds)
                ->count();

            // Latest Views
            $content->latest_views = $content->views()
                ->with('user')
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($view) {
                    $view->user_first_name = $view->user->first_name ?? 'N/A';
                    $view->user_last_name = $view->user->last_name ?? 'N/A';
                    unset($view->user);
                    return $view;
                });

            // Content Handling
            $content->content = null;
            $content->file = null;
            $content->file_mime = null;
            $content->file_size = null;

            // Media Retrieval
            $collections = ['images', 'documents', 'powerpoints'];
            foreach ($collections as $collection) {
                $media = $content->getFirstMedia($collection);
                if ($media) {
                    $content->content = (object) [
                        'type' => $media->getCustomProperty('type'),
                        'source' => $media->getUrl(),
                    ];
                    if ($media->getCustomProperty('type') !== 'Video') {
                        try {
                            $content->file = base64_encode(file_get_contents($media->getPath()));
                            $content->file_mime = $media->mime_type;
                            $content->file_size = $media->size;
                        } catch (\Exception $e) {
                            Log::error("Failed to convert file to blob: " . $e->getMessage());
                        }
                    }
                    break;
                }
            }

            // Form, Video Check
            if (!$content->content) {
                if ($content->training_form_id) {
                    $formData = $content->form;
                    $content->content = $formData;
                    $content->content->type = "Form";
                    $content->item_count = $formData->items->count();
                    $content->total_points = $formData->items->sum('value') ?? 0;
                } elseif ($content->source) {
                    $content->content = (object) ['type' => 'Video', 'source' => $content->source];
                }
            }

            unset($content->form, $content->views);

            return response()->json(['status' => 200, 'content' => $content]);
        } else {
            return response()->json(['status' => 403, 'content' => null]);
        }
    }

    public function getEmployeeTrainingDetails($code)
    {
        //Log::info("TrainingsController::getEmployeeTrainingDetails");
        //Log::info($code);

        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
            ->where('client_id', $user->client_id)
            ->with('user')
            ->firstOrFail();

        $author = $training->user;

        $training->author_name = implode(' ', array_filter([
            $author->first_name ?? null,
            $author->middle_name ?? null,
            $author->last_name ?? null,
            $author->suffix ?? null
        ]));
        $training->author_title = $author->jobTitle->name;

        $training->cover = null;
        $training->cover_name = null;
        $media = $training->getFirstMedia('covers');
        if ($media) {
            $training->cover = base64_encode(file_get_contents($media->getPath()));
            $training->cover_name = $media->file_name;
        }
        $trainingData = $training->toArray();

        unset($trainingData['user']);

        return response()->json(['status' => 200, 'training' => $trainingData]);
    }

    public function getEmployeeTrainingContent($code)
    {
        // Log::info("TrainingsController::getEmployeeTrainingContent");
        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
            ->where('client_id', $user->client_id)
            ->select('id')
            ->firstOrFail();

        $content = TrainingContentModel::with(['form', 'media', 'views' => function ($query) use ($user) {
            $query->where('user_id', $user->id);
        }])
            ->where('training_id', $training->id)
            ->orderBy('order', 'asc')
            ->get()
            ->map(function ($cont) {
                $view = $cont->views->first();

                $cont->has_viewed = !is_null($view);
                $cont->viewed_at = $view ? $view->created_at : null;

                $cont->is_finished = false;
                $cont->completed_at = null;
                if ($view && $view->status === 'Finished') {
                    $cont->is_finished = true;
                    $cont->completed_at = $view->completed_at;
                }

                // Media Retrieval
                $collections = ['images', 'documents', 'powerpoints'];
                foreach ($collections as $collection) {
                    $media = $cont->getFirstMedia($collection);
                    if ($media) {
                        $cont->content = (object) [
                            'type' => $media->getCustomProperty('type'),
                            'source' => $media->getUrl(),
                        ];
                        if ($media->getCustomProperty('type') === 'Image') {
                            $cont->image = base64_encode(file_get_contents($media->getPath()));
                            $cont->mime = $media->mime_type;
                        }
                        break;
                    }
                }

                // Form, Video Check
                if (!$cont->content) {
                    if ($cont->training_form_id) {
                        $formData = $cont->form;
                        $cont->content = $formData;
                        $cont->empty_form = $formData->items->count() == 0;
                    } elseif ($cont->source) {
                        $cont->content = (object) ['type' => 'Video', 'source' => $cont->source];
                    }
                }

                unset($cont->views, $cont->form, $cont->media);

                return $cont;
            });

        return response()->json(['status' => 200, 'content' => $content]);
    }

    public function getEmployeeContentDetails($id)
    {
        // Log::info("TrainingsController::getEmployeeContentDetails");
        $user = Auth::user();

        $content = TrainingContentModel::with(['form', 'media', 'views' => function ($query) use ($user) {
            $query->where('user_id', $user->id);
        }])->find($id);

        if (!$content) {
            return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
        }

        // View Check
        $view = $content->views->first();
        $content->has_viewed = !is_null($view);
        $content->is_finished = $view && $view->status === 'Finished';

        unset($content->views);

        // Content Handling
        $content->content = null;
        $content->file = null;
        $content->file_mime = null;
        $content->file_size = null;

        // Media Retrieval
        $collections = ['images', 'documents', 'powerpoints'];
        foreach ($collections as $collection) {
            $media = $content->getFirstMedia($collection);
            if ($media) {
                $content->content = (object) [
                    'type' => $media->getCustomProperty('type'),
                    'source' => $media->getUrl(),
                ];
                if ($media->getCustomProperty('type') !== 'Video') {
                    try {
                        $content->file = base64_encode(file_get_contents($media->getPath()));
                        $content->file_mime = $media->mime_type;
                        $content->file_size = $media->size;
                    } catch (\Exception $e) {
                        Log::error("Failed to convert file to blob: " . $e->getMessage());
                    }
                }
                break;
            }
        }

        // Form, Video Check
        if (!$content->content) {
            if ($content->training_form_id) {
                $formData = $content->form;
                $content->content = $formData;
                $content->content->type = "Form";
            } elseif ($content->source) {
                $content->content = (object) ['type' => 'Video', 'source' => $content->source];
            }
        }

        unset($content->form, $content->media);

        return response()->json(['status' => 200, 'content' => $content]);
    }

    public function getPageCovers(Request $request)
    {
        //Log::info("TrainingsController::getPageCovers");
        $trainingIds = $request->input('training_ids', []);
        $trainings = TrainingsModel::whereIn('id', $trainingIds)->get();

        $covers = array_fill_keys($trainingIds, null);
        foreach ($trainings as $training) {
            $coverMedia = $training->getMedia('covers')->first();
            if ($coverMedia) {
                $covers[$training->id] = base64_encode(file_get_contents($coverMedia->getPath()));
            }
        }

        return response()->json(['status' => 200, 'covers' => array_values($covers)]);
    }

    public function getSource($id)
    {
        //Log::info("TrainingsController:getSource");
        //Log::info($id);
        $user = Auth::user();
        $content = TrainingContentModel::with('training')->find($id);

        if (!$content) {
            return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
        }

        $clientId = $content->training->client_id;

        if ($user->client_id == $clientId) {
            try {
                $collections = ['images', 'documents', 'powerpoints'];
                $media = null;
                foreach ($collections as $collection) {
                    $media = $content->getFirstMedia($collection);
                    if ($media && $media->getCustomProperty('type') !== 'Video') {
                        break;
                    }
                    $media = null;
                }

                if (!$media) {
                    return response()->json(['status' => 404, 'message' => 'Content file not found'], 404);
                }

                $fileContents = file_get_contents($media->getPath());
                $base64 = base64_encode($fileContents);
                $mimeType = $media->mime_type;
                $fileName = $media->file_name;

                return response()->json([
                    'status' => 200,
                    'file' => [
                        'data' => "data:{$mimeType};base64,{$base64}",
                        'name' => $fileName,
                        'size' => $media->size,
                        'type' => $mimeType
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error("Error fetching file for content ID {$id}: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error fetching file'], 500);
            }
        } else {
            return response()->json(['status' => 200, 'file' => null]);
        }
    }

    // Training Views --------------------------------------------------------------- /
    public function handleTrainingViews(Request $request)
    {
        // Log::info("TrainingsController::handleTrainingViews");
        // Log::info($request);

        $user = Auth::user();
        $training = TrainingsModel::where('unique_code', $request->input('code'))->select('id', 'client_id')->firstOrFail();
        $clientId = $training->client_id;

        if ($user->client_id == $clientId) {
            try {
                DB::beginTransaction();

                $content = TrainingContentModel::findOrFail($request->input('id'));

                $existing = TrainingViewsModel::where('training_content_id', $content->id)
                    ->where('user_id', $user->id)
                    ->exists();

                $isImageContent = false;
                $collections = ['images', 'documents', 'powerpoints'];
                foreach ($collections as $collection) {
                    $media = $content->getFirstMedia($collection);
                    if ($media) {
                        $isImageContent = $media->getCustomProperty('type') === 'Image';
                        break;
                    }
                }

                if ($request->input("finished")) {
                    if ($isImageContent) {
                        if (!$existing) {
                            TrainingViewsModel::create([
                                'user_id' => $user->id,
                                'training_id' => $training->id,
                                'training_content_id' => $content->id,
                                'status' => "Finished",
                                'completed_at' => Carbon::now(),
                            ]);
                        }
                    } else {
                        $view = TrainingViewsModel::where('training_content_id', $content->id)
                            ->where('user_id', $user->id)
                            ->firstOrFail();
                        $view->status = "Finished";
                        $view->completed_at = Carbon::now();
                        $view->save();
                    }
                } else {
                    if (!$existing) {
                        TrainingViewsModel::create([
                            'user_id' => $user->id,
                            'training_id' => $training->id,
                            'training_content_id' => $content->id,
                            'status' => "Viewed",
                        ]);
                    }
                }

                DB::commit();

                return response()->json(['status' => 200, 'message' => "Progress recorded successfully"]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Failed to record user progress for content ID {$request->input('id')}: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => "Failed to record user progress"]);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function getTrainingViews($id)
    {
        // Log::info("TrainingsController:getTrainingViews");
        // Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            $views = TrainingViewsModel::with('user')
                ->where('training_content_id', $id)
                ->orderBy('created_at', 'desc')
                ->get();

            $viewedIds = $views->pluck('user_id')->toArray();

            $views = $views->map(function ($view) {
                $emp = $view->user;
                return [
                    'emp_id' => $emp->id,
                    'emp_first_name' => $emp->first_name,
                    'emp_middle_name' => $emp->middle_name ?? '',
                    'emp_last_name' => $emp->last_name,
                    'emp_suffix' => $emp->suffix ?? '',
                    'emp_profile_pic' => $emp->profile_pic ?? null,
                    'status' => $view->status,
                    'viewed_at' => $view->created_at,
                    'completed_at' => $view->completed_at ?? null,
                ];
            })->all();

            $noViews = UsersModel::where('client_id', $user->client_id)
                ->where('user_type', 'Employee')
                ->whereNotIn('id', $viewedIds)
                ->get()
                ->map(function ($emp) {
                    return [
                        'emp_id' => $emp->id,
                        'emp_first_name' => $emp->first_name,
                        'emp_middle_name' => $emp->middle_name ?? '',
                        'emp_last_name' => $emp->last_name,
                        'emp_suffix' => $emp->suffix ?? '',
                        'emp_profile_pic' => $emp->profile_pic ?? null,
                    ];
                })->all();

            return response()->json(['status' => 200, 'views' => $views, 'no_views' => $noViews]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    // Others ----------------------------------------------------------------------- /
    function generateRandomCode($length)
    {
        // log::info("TrainingsController::generateRandomCode");
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $result = '';
        $charsLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[rand(0, $charsLength - 1)];
        }

        return $result;
    }
}
