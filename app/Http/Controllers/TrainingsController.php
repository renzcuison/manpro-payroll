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
            if ($this->checkUser()) {
                $trainings = TrainingsModel::where('client_id', $user->client_id)->get();
            }

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

                $training = TrainingsModel::create([
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

    public function getTrainingMedia($id)
    {
        //Log::info("TrainingsController::getTrainingMedia");
        $user = Auth::user();

        $media = TrainingMediaModel::where('training_id', $id)
            ->select('id', 'order', 'url')
            ->orderBy('order', 'asc')
            ->get();

        return response()->json(['status' => 200, 'media' => $media]);
    }

    public function getPageCovers(Request $request)
    {
        //Log::info("TrainingsController::getPageCovers");

        $user = Auth::user();

        $trainingIds = $request->input('training_ids', []);

        $covers = array_fill_keys($trainingIds, null);

        $coverFiles = TrainingsModel::where('id', $trainingIds)
            ->select('id', 'cover_photo')
            ->get();

        $coverFiles->each(function ($file) use (&$covers) {
            $covers[$file->id] = base64_encode(Storage::disk('public')->get($file->cover_photo));
        });

        return response()->json(['status' => 200, 'covers' => array_values($covers)]);
    }
}
