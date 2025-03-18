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

    public function getTrainings()
    {
        //Log::info("TrainingsController::getTrainings");
        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                $trainings = TrainingsModel::where('client_id', $user->client_id)
                    ->with(['contents' => function ($query) {
                        $query->with('content');
                    }])
                    ->get();

                $trainings->each(function ($training) {
                    $mediaTypes = $training->contents->pluck('content.type')->filter()->unique();
                    $contentModels = $training->contents->pluck('content')->filter();

                    $training->video = $mediaTypes->contains('Video');
                    $training->image = $mediaTypes->contains('Image');
                    $training->attachment = $mediaTypes->contains('Document');
                    $training->form = $contentModels->contains(function ($content) {
                        return $content instanceof \App\Models\TrainingFormsModel;
                    });
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

        if ($this->checkUser()) {

            $training = TrainingsModel::where('unique_code', $request->input('unique_code'))->firstOrFail();

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

                // Relationship Prep
                $contentData = null;
                $source = null;

                // Content Type Handler
                switch ($contentType) {
                    case 'Video':
                        $source = $request->input('link');
                        if (!$source) {
                            return response()->json(['status' => 400, 'message' => 'Video link is required'], 400);
                        }
                        $contentData = TrainingMediaModel::create(['type' => $contentType, 'source' => $source]);
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
                        break;

                    case 'Form':
                        // FEATURE COMING SOON
                        //$contentData = TrainingFormsModel::create([]); 
                        break;

                    default:
                        return response()->json(['status' => 400, 'message' => 'Invalid content type'], 400);
                }

                // Final Save
                $trainingContent = new TrainingContentModel([
                    'training_id' => $training->id,
                    'order' => $nextOrder,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                ]);
                $contentData->trainingContent()->save($trainingContent);

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content saved successfully']);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving content: " . $e->getMessage());
                // Transaction Fail Cleanup
                if (isset($source) && $contentType !== 'Video' && $contentType !== 'Form' && Storage::disk('public')->exists($source)) {
                    Storage::disk('public')->delete($source);
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

            try {
                DB::beginTransaction();

                $content->title = $request->input('title', $content->title);
                $content->description = $request->input('description', $content->description);
                $content->order = $request->input('order', $content->order);

                $relatedContent = $content->content;
                if (!$relatedContent) {
                    return response()->json(['status' => 400, 'message' => 'Related content not found'], 400);
                }

                $dateTime = now()->format('YmdHis');
                $contentType = $relatedContent->type;

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
                        Log::info($request->input('newFile'));
                        if ($request->hasFile('file') && $request->input('newFile') == "true") {
                            Log::info("Replacing File");
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

                    default:
                        Log::info("Content is of type Form. Editor Function to be added soon");
                        break;
                }

                // Save the parent content
                $content->save();

                DB::commit();

                return response()->json(['status' => 200, 'message' => 'Content updated successfully']);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error updating content ID {$request->input('id')}: " . $e->getMessage());
                if (isset($newSource) && $contentType !== 'Video' && Storage::disk('public')->exists($newSource)) {
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

            $content = TrainingContentModel::with('content')
                ->where('training_id', $training->id)
                ->orderBy('order', 'asc')
                ->get();

            return response()->json(['status' => 200, 'content' => $content]);
        } else {
            return response()->json(['status' => 200, 'content' => null]);
        }
    }

    public function getContentDetails($id)
    {
        Log::info("TrainingsController::getContentDetails");
        Log::info($id);

        $user = Auth::user();

        $content = TrainingContentModel::with('content')->find($id);

        return response()->json(['status' => 200, 'content' => $content]);
    }

    public function getTrainingMedia($code)
    {
        //Log::info("TrainingsController::getTrainingMedia");
        $user = Auth::user();

        if ($this->checkUser()) {
            $training = TrainingsModel::where('unique_code', $code)
                ->select('id')
                ->firstOrFail();

            $media = TrainingMediaModel::where('training_id', $training->id)
                ->select('id', 'path', 'type')
                ->get();

            $videoData = $media->where('type', 'Video')
                ->map(function ($md) {
                    return [
                        'id' => $md->id,
                        'url' => $md->url,
                        'type' => $md->type
                    ];
                })
                ->values()
                ->all();

            $imageData = $media->where('type', 'Image')
                ->map(function ($md) {
                    return [
                        'id' => $md->id,
                        'filename' => basename($md->path),
                        'type' => $md->type
                    ];
                })
                ->values()
                ->all();

            $attachmentData = $media->where('type', 'Document')
                ->map(function ($md) {
                    return [
                        'id' => $md->id,
                        'filename' => basename($md->path),
                        'type' => $md->type
                    ];
                })
                ->values()
                ->all();

            return response()->json([
                'status' => 200,
                'videos' => $videoData,
                'images' => $imageData,
                'attachments' => $attachmentData
            ]);
        } else {
            return response()->json(['status' => 200, 'videos' => null, 'images' => null, 'attachments' => null]);
        }
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
        Log::info("TrainingsController:getSource");
        Log::info($id);

        try {
            $content = TrainingContentModel::find($id);
            if (!$content || !$content->content->source) {
                return response()->json(['status' => 404, 'message' => 'Content not found'], 404);
            }

            $filePath = $content->content->source;
            $fileContents = Storage::disk('public')->get($filePath);
            $base64 = base64_encode($fileContents);

            $mimeType = Storage::disk('public')->mimeType($filePath);
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
