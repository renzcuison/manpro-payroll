<?php

namespace App\Http\Controllers;

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
            $trainings = TrainingsModel::where('client_id', $user->client_id)
                ->with(['media' => function ($query) {
                    $query->select('training_id', 'type');
                }])
                ->get();

            $trainings->each(function ($training) {
                $training->video = $training->media->contains('type', 'Video');
                $training->image = $training->media->contains('type', 'Image');
                $training->attachment = $training->media->contains('type', 'Document');
            });

            return response()->json(['status' => 200, 'trainings' => $trainings]);
        } else {
            return response()->json(['status' => 200, 'trainings' => null]);
        }
    }

    public function saveTraining(Request $request)
    {
        //Log::info("TrainingsController::saveTraining");
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

                $training = TrainingsModel::create([
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

                $orderCounter = 0;

                // Save Links
                if ($request->has('link')) {
                    foreach ($request->input('link') as $link) {
                        $orderCounter++;
                        TrainingMediaModel::create([
                            'training_id' => $training->id,
                            'path' => null,
                            'url' => $link,
                            'type' => "Video",
                            'order' => $orderCounter
                        ]);
                    }
                }

                // Save Attachments
                if ($request->hasFile('attachment')) {
                    foreach ($request->file('attachment') as $file) {
                        $orderCounter++;
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('trainings/attachments', $fileName, 'public');
                        TrainingMediaModel::create([
                            'training_id' => $training->id,
                            'path' => $filePath,
                            'url' => null,
                            'type' => "Document",
                            'order' => $orderCounter
                        ]);
                    }
                }

                // Save Images
                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $file) {
                        $orderCounter++;
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('trainings/images', $fileName, 'public');
                        TrainingMediaModel::create([
                            'training_id' => $training->id,
                            'path' => $filePath,
                            'url' => null,
                            'type' => "Image",
                            'order' => $orderCounter
                        ]);
                    }
                }


                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 200]);
        }

        return response()->json(['status' => 200]);
    }

    public function getTrainingDetails($code)
    {
        Log::info("TrainingsController::getTrainingDetails");
        Log::info($code);

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
            } else {
                $training->cover = null;
            }

            $trainingData = $training->toArray();
            unset($trainingData['user']);

            return response()->json(['status' => 200, 'training' => $trainingData]);
        } else {
            return response()->json(['status' => 200, 'training' => null]);
        }
    }

    public function getTrainingMedia($code)
    {
        //Log::info("AnnouncementsController::getTrainingMedia");
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
