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

    public function getTrainings()
    {
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
                    'training_course_id' => $request->input('course'),
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'cover_photo' => $coverPath,
                    'start_date' => $request->input('start_date'),
                    'end_date' => $request->input('end_date'),
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

                throw $e;
            }
        }
    }

    // Update for Readability
    public function updateTraining(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'cover_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $user = Auth::user();
            $training = TrainingsModel::where('id', $request->input('id'))->where('client_id', $user->client_id)->first();

            if (!$training) {
                return response()->json(['status' => 404, 'message' => 'Training not found']);
            }

            if ($request->hasFile('cover_photo')) {
                if ($training->cover_photo) {
                    Storage::disk('public')->delete($training->cover_photo);
                }
                $training->cover_photo = $request->file('cover_photo')->store('trainings/covers', 'public');
            }

            $training->update($request->only(['title', 'description', 'start_date', 'end_date']));

            return response()->json(['status' => 200, 'message' => 'Training updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['status' => 500, 'message' => 'Error updating training', 'error' => $e->getMessage()]);
        }
    }

    public function deleteTraining(Request $request)
    {
        $user = Auth::user();

        if ($this->checkUser()) {
            $training = TrainingsModel::find($request->input('id'));

            try {
                DB::beginTransaction();
                $training->delete();
                DB::commit();
                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                throw $e;
            }
        }
    }

    //Admin Only, Simplify Code, if Not Admin, Return 'views' = null, not 401
    public function getTrainingViews(Request $request)
    {
        $training = TrainingsModel::find($request->input('id'));

        if (!$training) {
            return response()->json(['status' => 404, 'message' => 'Training not found'], 404);
        }

        $views = TrainingViewsModel::where('training_id', $request->input('id'))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['status' => 200, 'views' => $views]);
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
