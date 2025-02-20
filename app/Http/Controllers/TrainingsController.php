<?php

namespace App\Http\Controllers;

use App\Models\ApplicationsModel;
use App\Models\ApplicationTypesModel;
use App\Models\ApplicationFilesModel;
use App\Models\LeaveCreditsModel;

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
        // Log::info("TrainingsController::checkUser");

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
        // Log::info("TrainingsController::getTrainingCourses");
        $user = Auth::user();
    }
}
