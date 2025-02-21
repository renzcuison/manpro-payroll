<?php

namespace App\Http\Controllers;

use App\Models\TrainingsModel;
use App\Models\TrainingCoursesModel;

use App\Models\TrainingsVideoModel;
use App\Models\TrainingCViewsModel;
use App\Models\TrainingImagesModel;
use App\Models\TrainingVideoModel;
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

    public function getTrainingCourses()
    {
        //Log::info("TrainingsController::getTrainingCourses");
        $user = Auth::user();
        if ($this->checkUser()) {
            $courses = TrainingCoursesModel::where('client_id', $user->client_id)->get();
            return response()->json(['status' => 200, 'courses' => $courses]);
        } else {
            return response()->json(['status' => 200, 'courses' => null]);
        }
    }

    public function saveTraining(Request $request)
    {
        //Log::info("TrainingsController::saveTraining");
        $user = Auth::user();
        Log::info($request);


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
                    'training_course_id' => $request->input('course'),
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'cover_photo' => $coverPath,
                    'start_date' => $request->input('start_date'),
                    'end_date' => $request->input('end_date'),
                    'duration' => $request->input('duration'),
                    'client_id' => $user->client_id,
                    'created_by' => $user->id,
                ]);

                foreach ($request->input('link') as $link) {
                    TrainingVideoModel::create([
                        'training_id' => $training->id,
                        'url' => $link
                    ]);
                }

                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $index => $file) {
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('trainings/images', $fileName, 'public');
                        TrainingImagesModel::create([
                            'training_id' => $training->id,
                            'order' => $index + 1,
                            'path' => $filePath,
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

        $links = TrainingVideoModel::where('training_id', $id)
            ->select('id', 'url')
            ->get();

        $files = TrainingImagesModel::where('training_id', $id)
            ->select('id', 'order', 'path')
            ->orderBy('order', 'asc')
            ->get();

        $images = [];
        foreach ($files as $file) {
            $images[] = [
                'id' => $file->id,
                'order' => $file->order,
                'filename' => basename($file->path),
            ];
        }

        return response()->json(['status' => 200, 'links' => $links, 'images' => $images ? $images : null]);
    }

    /*
    getTrainingMedia

    Request $request - only input is id
    get All Training Videos and Training Images by id

    $trainingvideo->training_id  and $trainingvideo->training_id must match with id (query)
    
    Training Videos must be Str Array, Training Images must be Base 64 Array

    return 'status', 'training_videos', 'training_images'
    */

    /*
    getMyTrainings

    - getTrainings by client_id and status "Published"
    
    return status, trainings
    */

    /*
    getTrainingCovers

    - get Cover Images based on the list of visible trainings in Employee Page
    - Return Base 64 Array
    - use getThumbnails in AnnouncementController as Reference

    */
}
