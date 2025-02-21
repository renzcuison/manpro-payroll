<?php

namespace App\Http\Controllers;

use App\Models\TrainingsModel;
use App\Models\TrainingCoursesModel;

use App\Models\TrainingsVideoModel;
use App\Models\TrainingCViewsModel;
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

                //COVER PATH FUNCTION
                // if ($request->hasFile('cover_photo')) {
                //     $file = $request->file('cover_photo');
                //     $coverPath = $file->store('trainings/covers', 'public');
                // }

                /*
                const formData = new FormData();
                formData.append("course", course);
                formData.append("title", title);
                formData.append("description", description);
                formData.append("from_date", fromDate.format("YYYY-MM-DD HH:mm:ss"));
                formData.append("to_date", toDate.format("YYYY-MM-DD HH:mm:ss"));
                formData.append("cover_image", coverImage);
                if (links.length > 0) {
                    links.forEach(link => {
                        formData.append('link[]', link);
                    });
                }
                if (image.length > 0) {
                    image.forEach(file => {
                        formData.append('image[]', file);
                    });
                }

                */

                $training = TrainingsModel::create([
                    'training_course_id' => $request->input('course'),
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'cover_photo' => null, //$coverPath
                    'start_date' => $request->input('start_date'),
                    'end_date' => $request->input('end_date'),
                    'client_id' => $user->client_id,
                    'created_by' => $user->id,
                ]);



                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                throw $e;
            }
        }
    }

    public function updateTraining(Request $request, $id)
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
            $training = TrainingsModel::where('id', $id)->where('client_id', $user->client_id)->first();

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

    public function deleteTraining($id)
    {
        $training = TrainingsModel::find($id);

        if (!$training) {
            return response()->json(['status' => 404, 'message' => 'Training not found']);
        }

        try {
            DB::beginTransaction();
            $training->delete();
            DB::commit();
            return response()->json(['status' => 200, 'message' => 'Training deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting training: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error deleting training']);
        }
    }

    public function trackTrainingView($trainingId)
    {
        $user = Auth::user();

        // Check if training exists
        $training = TrainingsModel::find($trainingId);
        if (!$training) {
            return response()->json(['status' => 404, 'message' => 'Training not found'], 404);
        }

        // Check if the user already viewed this training
        $existingView = TrainingViewsModel::where('user_id', $user->id)
            ->where('training_id', $trainingId)
            ->first();

        if ($existingView) {
            // Update timestamp (updated_at)
            $existingView->touch();
        } else {
            // Create new view record
            TrainingViewsModel::create([
                'user_id' => $user->id,
                'training_id' => $trainingId,
            ]);
        }

        return response()->json(['status' => 200, 'message' => 'Training view recorded']);
    }

    public function getTrainingViews($trainingId)
    {
        $training = TrainingsModel::find($trainingId);

        if (!$training) {
            return response()->json(['status' => 404, 'message' => 'Training not found'], 404);
        }

        $views = TrainingViewsModel::where('training_id', $trainingId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['status' => 200, 'views' => $views]);
    }
}
