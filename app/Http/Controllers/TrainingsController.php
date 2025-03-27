<?php

namespace App\Http\Controllers;

use App\Models\TrainingContentModel;
use App\Models\TrainingFormsModel;
use App\Models\TrainingsModel;
use App\Models\TrainingMediaModel;
use App\Models\TrainingViewsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

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

    // Training List
    public function getTrainings()
    {
        //Log::info("TrainingsController::getTrainings");
        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                $trainings = TrainingsModel::where('client_id', $user->client_id)
                    ->select('trainings.*')
                    ->addSelect([
                        // Video Check
                        'has_video' => function ($query) {
                            $query->selectRaw('COUNT(*)')
                                ->from('training_content')
                                ->join('training_media', 'training_content.training_media_id', '=', 'training_media.id')
                                ->whereColumn('training_content.training_id', 'trainings.id')
                                ->where('training_media.type', 'Video');
                        },
                        // Image Check
                        'has_image' => function ($query) {
                            $query->selectRaw('COUNT(*)')
                                ->from('training_content')
                                ->join('training_media', 'training_content.training_media_id', '=', 'training_media.id')
                                ->whereColumn('training_content.training_id', 'trainings.id')
                                ->where('training_media.type', 'Image');
                        },
                        // Document, PowerPoint Check
                        'has_attachment' => function ($query) {
                            $query->selectRaw('COUNT(*)')
                                ->from('training_content')
                                ->join('training_media', 'training_content.training_media_id', '=', 'training_media.id')
                                ->whereColumn('training_content.training_id', 'trainings.id')
                                ->whereIn('training_media.type', ['Document', 'Powerpoint']);
                        },
                        // Form Check
                        'has_form' => function ($query) {
                            $query->selectRaw('COUNT(*)')
                                ->from('training_content')
                                ->whereColumn('training_content.training_id', 'trainings.id')
                                ->whereNotNull('training_content.training_form_id');
                        },
                    ])
                    ->get()
                    ->map(function ($training) {
                        // Final Content Checks
                        $training->video = (bool) $training->has_video;
                        $training->image = (bool) $training->has_image;
                        $training->attachment = (bool) $training->has_attachment;
                        $training->form = (bool) $training->has_form;

                        // Response Cleanup
                        unset($training->has_video, $training->has_image, $training->has_attachment, $training->has_form);

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
                ->where('start_date', "<=", now())
                ->where('end_date', ">=", now())
                ->select('trainings.*')
                ->addSelect([
                    // Video Check
                    'has_video' => function ($query) {
                        $query->selectRaw('COUNT(*)')
                            ->from('training_content')
                            ->join('training_media', 'training_content.training_media_id', '=', 'training_media.id')
                            ->whereColumn('training_content.training_id', 'trainings.id')
                            ->where('training_media.type', 'Video');
                    },
                    // Image Check
                    'has_image' => function ($query) {
                        $query->selectRaw('COUNT(*)')
                            ->from('training_content')
                            ->join('training_media', 'training_content.training_media_id', '=', 'training_media.id')
                            ->whereColumn('training_content.training_id', 'trainings.id')
                            ->where('training_media.type', 'Image');
                    },
                    // Document, PowerPoint Check
                    'has_attachment' => function ($query) {
                        $query->selectRaw('COUNT(*)')
                            ->from('training_content')
                            ->join('training_media', 'training_content.training_media_id', '=', 'training_media.id')
                            ->whereColumn('training_content.training_id', 'trainings.id')
                            ->whereIn('training_media.type', ['Document', 'PowerPoint']);
                    },
                    // Form Check
                    'has_form' => function ($query) {
                        $query->selectRaw('COUNT(*)')
                            ->from('training_content')
                            ->whereColumn('training_content.training_id', 'trainings.id')
                            ->whereNotNull('training_content.training_form_id');
                    },
                    // Training Completion Check
                    'is_completed' => function ($query) use ($user) {
                        $query->selectRaw('CASE
                        WHEN COUNT(*) = 0 THEN 0
                        WHEN SUM(CASE
                            WHEN EXISTS (
                                SELECT 1
                                FROM training_views
                                WHERE training_views.training_content_id = training_content.id
                                AND training_views.user_id = ?
                                AND training_views.status = "Finished"
                            ) THEN 1
                            ELSE 0
                        END) = COUNT(*) THEN 1
                        ELSE 0
                    END')
                            ->from('training_content')
                            ->whereColumn('training_content.training_id', 'trainings.id')
                            ->setBindings([$user->id]);
                    },
                ])
                ->get()
                ->map(function ($training) {
                    // Final Content Checks
                    $training->video = (bool) $training->has_video;
                    $training->image = (bool) $training->has_image;
                    $training->attachment = (bool) $training->has_attachment;
                    $training->form = (bool) $training->has_form;
                    $training->completed = (bool) $training->is_completed;

                    // Response Cleanup
                    unset($training->has_video, $training->has_image, $training->has_attachment, $training->has_form, $training->is_completed);

                    return $training;
                });

            return response()->json(['status' => 200, 'trainings' => $trainings]);
        } catch (\Exception $e) {
            Log::error("Error retrieving trainings: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error retrieving trainings'], 500);
        }
    }

    // Training CRUD
    public function saveTraining(Request $request)
    {
        //Log::info("TrainingsController::saveTraining");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $dateTime = now()->format('YmdHis');

                if ($request->hasFile('cover_image')) {
                    $cover = $request->file('cover_image');
                    $coverName = pathinfo($cover->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $cover->getClientOriginalExtension();
                    $coverPath = $cover->storeAs('trainings/covers', $coverName, 'public');
                }

                $uniqueCode = $this->generateRandomCode(16);
                while (TrainingsModel::where('unique_code', $uniqueCode)->exists()) {
                    $uniqueCode = $this->generateRandomCode(16);
                }

                TrainingsModel::create([
                    'unique_code' => $uniqueCode,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'cover_photo' => $coverPath,
                    'start_date' => $request->input('start_date'),
                    'end_date' => $request->input('end_date'),
                    'duration' => $request->input('duration'),
                    'client_id' => $user->client_id,
                    'created_by' => $user->id,
                ]);

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

                $dateTime = now()->format('YmdHis');

                $training->title = $request->input('title');
                $training->description = $request->input('description');
                $training->start_date = $request->input('start_date');
                $training->end_date = $request->input('end_date');
                $training->duration = $request->input('duration');

                if ($request->hasFile('cover_image')) {
                    $oldCover = $training->cover_photo;

                    $cover = $request->file('cover_image');
                    $coverName = pathinfo($cover->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $cover->getClientOriginalExtension();
                    $coverPath = $cover->storeAs('trainings/covers', $coverName, 'public');

                    $training->cover_photo = $coverPath;

                    if ($oldCover && Storage::disk('public')->exists($oldCover)) {
                        Storage::disk('public')->delete($oldCover);
                    }
                }

                $training->save();

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating: " . $e->getMessage());

                throw $e;
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

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $training = TrainingsModel::where('unique_code', $request->input('code'))->firstOrFail();
                $training->status = $request->input('status');
                $training->save();

                DB::commit();

                return response()->json(['status' => 200, 'message' => "Training status updated successfully"]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating: " . $e->getMessage());

                throw $e;
            }
        }
    }

    // Content CRUD
    public function saveContent(Request $request)
    {
        //Log::info("TrainingsController::saveContent");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            $training = TrainingsModel::where('unique_code', $request->input('unique_code'))->firstOrFail();
            $contentCount = TrainingContentModel::where('training_id', $training->id)->count();
            $nextOrder = $contentCount + 1;

            try {
                DB::beginTransaction();
                $contentType = $request->input('content_type');
                $dateTime = now()->format('YmdHis');

                $trainingMediaId = null;
                $trainingFormId = null;
                $source = null;

                switch ($contentType) {
                    case 'Video':
                        $source = $request->input('link');
                        if (!$source) {
                            return response()->json(['status' => 400, 'message' => 'Video link is required'], 400);
                        }
                        $contentData = TrainingMediaModel::create(['type' => $contentType, 'source' => $source]);
                        $trainingMediaId = $contentData->id;
                        break;

                    case 'Image':
                    case 'Document':
                    case 'PowerPoint':
                        if (!$request->hasFile('file')) {
                            return response()->json(['status' => 400, 'message' => 'File is required'], 400);
                        }
                        $file = $request->file('file');
                        $location = 'trainings/' . strtolower($contentType) . 's';
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $source = $file->storeAs($location, $fileName, 'public');
                        $contentData = TrainingMediaModel::create(['type' => $contentType, 'source' => $source]);
                        $trainingMediaId = $contentData->id;
                        break;

                    case 'Form':
                        // FEATURE COMING SOON
                        $contentData = TrainingFormsModel::create([]);
                        $trainingFormId = $contentData->id;
                        break;

                    default:
                        return response()->json(['status' => 400, 'message' => 'Invalid content type'], 400);
                }

                $trainingContent = new TrainingContentModel([
                    'training_id' => $training->id,
                    'training_media_id' => $trainingMediaId,
                    'training_form_id' => $trainingFormId,
                    'order' => $nextOrder,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                ]);
                $trainingContent->save();

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content saved successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving content: " . $e->getMessage());
                if (isset($source) && $contentType !== 'Video' && $contentType !== 'Form' && Storage::disk('public')->exists($source)) {
                    Storage::disk('public')->delete($source);
                }
                if (isset($trainingMediaId)) {
                    TrainingMediaModel::where('id', $trainingMediaId)->delete();
                }
                if (isset($trainingFormId)) {
                    TrainingFormsModel::where('id', $trainingFormId)->delete();
                }
                return response()->json(['status' => 500, 'message' => 'Error saving content'], 500);
            }
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
        }
    }

    public function editContent(Request $request)
    {
        // Log::info("TrainingsController::editContent");
        // Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            $content = TrainingContentModel::find($request->input('id'));

            if (!$content) {
                return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
            }

            try {
                DB::beginTransaction();

                $content->title = $request->input('title', $content->title);
                $content->description = $request->input('description', $content->description);
                $content->order = $request->input('order', $content->order);

                $relatedContent = null;
                $contentType = null;
                if ($content->training_media_id) {
                    $relatedContent = $content->media;
                    $contentType = $relatedContent ? $relatedContent->type : null;
                } elseif ($content->training_form_id) {
                    $relatedContent = $content->form;
                    $contentType = 'Form';
                }

                if (!$relatedContent) {
                    return response()->json(['status' => 400, 'message' => 'Related content not found'], 400);
                }

                $dateTime = now()->format('YmdHis');
                $newSource = null;

                switch ($contentType) {
                    case 'Video':
                        $newSource = $request->input('link');
                        if ($newSource && $newSource !== $relatedContent->source) {
                            $relatedContent->source = $newSource;
                            $relatedContent->save();
                        }
                        break;

                    case 'Image':
                    case 'Document':
                    case 'PowerPoint':
                        //Log::info($request->input('newFile'));
                        if ($request->hasFile('file') && $request->input('newFile') == "true") {
                            //Log::info("Replacing File");
                            $file = $request->file('file');
                            $location = 'trainings/' . strtolower($contentType) . 's';
                            $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                            $newSource = $file->storeAs($location, $fileName, 'public');

                            if ($relatedContent->source && $relatedContent->source !== $newSource && Storage::disk('public')->exists($relatedContent->source)) {
                                Storage::disk('public')->delete($relatedContent->source);
                            }

                            $relatedContent->source = $newSource;
                            $relatedContent->save();
                        }
                        break;

                    case 'Form':
                        Log::info("Content is of type Form. Editor Function to be added soon");
                        break;

                    default:
                        return response()->json(['status' => 400, 'message' => 'Invalid content type'], 400);
                }

                $content->save();

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content updated successfully']);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating content ID {$request->input('id')}: " . $e->getMessage());
                if (isset($newSource) && $contentType !== 'Video' && $contentType !== 'Form' && Storage::disk('public')->exists($newSource)) {
                    Storage::disk('public')->delete($newSource);
                }

                return response()->json(['status' => 500, 'message' => 'Error updating content'], 500);
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

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $content = TrainingContentModel::find($request->input('id'));
                if (!$content) {
                    return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
                }

                $deletedOrder = $content->order;
                $content->order = null;
                $content->save();
                $content->delete();

                TrainingContentModel::where('order', '>', $deletedOrder)
                    ->decrement('order', 1);

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content removed successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error removing content: " . $e->getMessage());
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

        $order = $request->input('new_order');
        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                $training = TrainingsModel::where('unique_code', $request->input('unique_code'))
                    ->with('contents')
                    ->firstOrFail();

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

    // Training/Content Details
    public function getTrainingDetails($code)
    {
        //Log::info("TrainingsController::getTrainingDetails");
        //Log::info($code);

        $user = Auth::user();

        if ($this->checkUser()) {
            $training = TrainingsModel::where('unique_code', $code)
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

            if ($training->cover_photo) {
                $training->cover = base64_encode(Storage::disk('public')->get($training->cover_photo));
                $training->cover_name = basename($training->cover_photo);
            } else {
                $training->cover = null;
                $training->cover_name = null;
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

        if ($this->checkUser()) {
            $training = TrainingsModel::where('unique_code', $code)
                ->select('id')
                ->firstOrFail();

            $content = TrainingContentModel::with(['form', 'media'])
                ->where('training_id', $training->id)
                ->orderBy('order', 'asc')
                ->get()
                ->map(function ($cont) {
                    if ($cont->training_media_id) {
                        $cont->content = $cont->media;
                    } elseif ($cont->training_form_id) {
                        $cont->content = $cont->form;
                    } else {
                        $cont->content = null;
                    }

                    if ($cont->training_media_id && $cont->media && $cont->media->type === 'Image') {
                        $filePath = $cont->media->source;
                        $fullPath = storage_path('app/public/' . $filePath);
                        if (Storage::disk('public')->exists($filePath)) {
                            $cont->image = base64_encode(Storage::disk('public')->get($filePath));
                            $cont->mime = mime_content_type($fullPath);
                        } else {
                            $cont->image = null;
                            $cont->mime = null;
                        }
                    } else {
                        $cont->image = null;
                        $cont->mime = null;
                    }

                    unset($cont->form, $cont->media);
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

        // Content Constructor
        if ($content->training_media_id) {
            $content->content = $content->media;
        } elseif ($content->training_form_id) {
            $content->content = $content->form;
        } else {
            $content->content = null;
        }

        $content->file = null;
        $content->file_mime = null;
        $content->file_size = null;

        // File -> Blob Conversion
        if ($content->training_media_id && $content->media && $content->media->type !== 'Video') {
            try {
                $filePath = $content->media->source;
                $fullPath = storage_path('app/public/' . $filePath);
                if (Storage::disk('public')->exists($filePath)) {
                    $content->file = base64_encode(Storage::disk('public')->get($filePath));
                    $content->file_mime = mime_content_type($fullPath);
                    $content->file_size = filesize($fullPath);
                }
            } catch (\Exception $e) {
                Log::error("Failed to convert file to blob: " . $e->getMessage());
            }
        }

        unset($content->form, $content->media);

        return response()->json(['status' => 200, 'content' => $content]);
    }

    public function getEmployeeTrainingDetails($code)
    {
        //Log::info("TrainingsController::getEmployeeTrainingDetails");
        //Log::info($code);

        $user = Auth::user();

        $training = TrainingsModel::where('unique_code', $code)
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

        if ($training->cover_photo) {
            $training->cover = base64_encode(Storage::disk('public')->get($training->cover_photo));
            $training->cover_name = basename($training->cover_photo);
            $training->cover_mime =  mime_content_type(storage_path('app/public/' . $training->cover_photo));
        } else {
            $training->cover = null;
            $training->cover_name = null;
            $training->cover_mime = null;
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
            ->select('id')
            ->firstOrFail();

        $content = TrainingContentModel::with(['form', 'media', 'views' => function ($query) use ($user) {
            $query->where('user_id', $user->id);
        }])
            ->where('training_id', $training->id)
            ->orderBy('order', 'asc')
            ->get()
            ->map(function ($contentItem) {
                $view = $contentItem->views->first();

                $contentItem->has_viewed = !is_null($view);

                $contentItem->is_finished = false;
                $contentItem->completed_at = null;
                if ($view && $view->status === 'Finished') {
                    $contentItem->is_finished = true;
                    $contentItem->completed_at = $view->completed_at;
                }

                // Content Constructor
                if ($contentItem->training_media_id) {
                    $contentItem->content = $contentItem->media;
                } elseif ($contentItem->training_form_id) {
                    $contentItem->content = $contentItem->form;
                } else {
                    $contentItem->content = null;
                }

                if ($contentItem->training_media_id && $contentItem->media && $contentItem->media->type === 'Image') {
                    $filePath = $contentItem->media->source;
                    $fullPath = storage_path('app/public/' . $filePath);
                    if (Storage::disk('public')->exists($filePath)) {
                        $contentItem->image = base64_encode(Storage::disk('public')->get($filePath));
                        $contentItem->mime = mime_content_type($fullPath);
                    } else {
                        $contentItem->image = null;
                        $contentItem->mime = null;
                    }
                } else {
                    $contentItem->image = null;
                    $contentItem->mime = null;
                }

                unset($contentItem->views, $contentItem->form, $contentItem->media);

                return $contentItem;
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

        // Content Constructor
        if ($content->training_media_id) {
            $content->content = $content->media;
        } elseif ($content->training_form_id) {
            $content->content = $content->form;
        } else {
            $content->content = null;
        }

        $content->file = null;
        $content->file_mime = null;
        $content->file_size = null;

        // File -> Blob Conversion
        if ($content->training_media_id && $content->media && $content->media->type !== 'Video') {
            try {
                $filePath = $content->media->source;
                $fullPath = storage_path('app/public/' . $filePath);
                if (Storage::disk('public')->exists($filePath)) {
                    $content->file = base64_encode(Storage::disk('public')->get($filePath));
                    $content->file_mime = mime_content_type($fullPath);
                    $content->file_size = filesize($fullPath);
                }
            } catch (\Exception $e) {
                Log::error("Failed to convert file to blob: " . $e->getMessage());
            }
        }

        unset($content->form, $content->media);

        return response()->json(['status' => 200, 'content' => $content]);
    }

    public function getPageCovers(Request $request)
    {
        //Log::info("TrainingsController::getPageCovers");

        $user = Auth::user();

        $trainingIds = $request->input('training_ids', []);

        $covers = array_fill_keys($trainingIds, null);

        $coverFiles = TrainingsModel::whereIn('id', $trainingIds)
            ->select('id', 'cover_photo')
            ->get();

        $coverFiles->each(function ($file) use (&$covers) {
            $covers[$file->id] = base64_encode(Storage::disk('public')->get($file->cover_photo));
        });

        return response()->json(['status' => 200, 'covers' => array_values($covers)]);
    }

    public function getSource($id)
    {
        //Log::info("TrainingsController:getSource");
        //Log::info($id);

        try {
            $content = TrainingContentModel::with('media')->find($id);
            if (!$content || !$content->media->source) {
                return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
            }

            $filePath = $content->media->source;
            $fileContents = Storage::disk('public')->get($filePath);
            $base64 = base64_encode($fileContents);

            $mimeType = mime_content_type(storage_path('app/public/' . $filePath));
            $fileName = basename($filePath);

            return response()->json([
                'status' => 200,
                'file' => [
                    'data' => "data:{$mimeType};base64,{$base64}",
                    'name' => $fileName,
                    'size' => Storage::disk('public')->size($filePath),
                    'type' => $mimeType
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching file for content ID {$id}: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error fetching file'], 500);
        }
    }

    // Training Views
    public function handleTrainingViews(Request $request)
    {
        //Log::info("TrainingsController:handleTrainingViews");
        //Log::info($request);

        $user = Auth::user();

        try {
            DB::beginTransaction();

            $training = TrainingsModel::where('unique_code', $request->input('code'))->select('id')->firstOrFail();
            $content = TrainingContentModel::find($request->input('id'));

            $existing = TrainingViewsModel::with(['form', 'media'])
                ->where('training_content_id', $content->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($request->input("finished")) {
                if ($content->media->type == "Image") {
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
                    ]);
                }
            }

            DB::commit();

            return response()->json(['status' => 200, 'message' => "Progress recorded successfully"]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['status' => 500, 'message' => "Failed to record user progress"]);
        }
    }

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
