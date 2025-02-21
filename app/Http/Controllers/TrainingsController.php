<?php

namespace App\Http\Controllers;

use App\Models\TrainingsModel;
use App\Models\TrainingCoursesModel;

use App\Models\TrainingsVideoModel;
use App\Models\TrainingCViewsModel;

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
            //Log::info($courses);
            return response()->json(['status' => 200, 'courses' => $courses]);
        }
        return response()->json(['status' => 403, 'message' => 'Unauthorized']);
    }

    public function getMyTrainingCourses()
    {
        $user = Auth::user();

        // Ensure client_id exists in the trainings table before using it
        $query = TrainingsModel::where('user_id', $user->id);

        // Only apply client_id filtering if it exists in the table
        if (Schema::hasColumn('trainings', 'client_id')) {
            $query->where('client_id', $user->client_id);
        }

        $trainings = $query->get();

        if ($trainings->isEmpty()) {
            return response()->json(['status' => 404, 'message' => 'No trainings found'], 404);
        }

        return response()->json(['status' => 200, 'trainings' => $trainings]);
    }

    public function getTrainingById($id)
    {
        $user = Auth::user();
        $training = TrainingsModel::with(['videos', 'views'])
            ->where('id', $id)
            ->where('client_id', $user->client_id)
            ->first();

        if (!$training) {
            return response()->json(['status' => 404, 'message' => 'Training not found']);
        }

        return response()->json([
            'status' => 200,
            'training' => $training,
            'videos' => $training->videos,
            'views_count' => $training->views->count(),
        ]);
    }

    public function saveTraining(Request $request)
    {
        $user = Auth::user();

        try {
            DB::beginTransaction();

            $training = TrainingsModel::create([
                'training_course_id' => $request->input('training_course_id'),
                'title' => $request->input('title'),
                'description' => $request->input('description') ?? "",
                'cover_photo' => null,
                'duration' => $request->input('duration'),
                'client_id' => $user->client_id,
                'created_by' => $user->id,
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
            ]);

            if ($request->hasFile('cover_photo')) {
                $file = $request->file('cover_photo');
                $filePath = $file->store('trainings/covers', 'public');
                $training->update(['cover_photo' => $filePath]);
            }

            DB::commit();
            return response()->json(['status' => 200, 'message' => 'Training saved successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 500, 'error' => $e->getMessage()], 500);
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
        $existingView = TrainingView::where('user_id', $user->id)
            ->where('training_id', $trainingId)
            ->first();

        if ($existingView) {
            // Update timestamp (updated_at)
            $existingView->touch();
        } else {
            // Create new view record
            TrainingView::create([
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

        $views = TrainingView::where('training_id', $trainingId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['status' => 200, 'views' => $views]);
    }
}
