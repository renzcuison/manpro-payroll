<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ApplicationsModel;
use App\Models\AnnouncementsModel;
use App\Models\AttendanceLogsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function checkUser()
    {
        // Log::info("AdminDashboardController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getDashboardCounters()
    {

        // Log::info("AdminDashboardController::getDashboardCounters");
        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;

            $counter = [];
            $average = [];
            $attendance = [];

            // ---- Counter Rows ---- //
            // Get Employees
            $employees = UsersModel::where('client_id', $clientId)->get();
            $counter['head_count'] = count($employees);

            // Get Applications
            $applications = ApplicationsModel::where('client_id', $clientId)->get();
            $counter['application_count'] = count($applications);

            // Get Announcements
            $counter['announcement_count'] = AnnouncementsModel::where('client_id', $clientId)
                ->whereNotNull('published')
                ->where('hidden', false)
                ->count();

            // Get Trainings (TABLE NOT YET ADDED, PLACEHOLDER USED)
            $counter['training_count'] = 0;

            // Get Average Age with Decimal Precision
            if ($employees->count() > 0) {
                $totalAge = 0;
                foreach ($employees as $employee) {
                    $birthDate = Carbon::parse($employee->birth_date);
                    $today = Carbon::now();
                    $age = $today->diffInYears($birthDate) + ($today->diffInMonths($birthDate) % 12 / 12) + ($today->diffInDays($birthDate) % 30.42 / 365.25); // This gives the age with decimal precision

                    $totalAge += $age;
                }
                $average['age'] = round($totalAge / $employees->count(), 1);
            }

            // Get Average Tenureship with Decimal Precision
            if ($employees->count() > 0) {
                $totalTenure = 0;
                foreach ($employees as $employee) {
                    $hireDate = Carbon::parse($employee->date_start);
                    $today = Carbon::now();
                    $tenureInYears = $today->diffInYears($hireDate) + ($today->diffInMonths($hireDate) % 12 / 12) + ($today->diffInDays($hireDate) % 30.42 / 365.25);

                    $totalTenure += $tenureInYears;
                }
                $average['tenure'] = round($totalTenure / $employees->count(), 1);
            }

            // ---- Attendance Pie Chart ---- //
            // Present Counter
            $attendance['present_count'] = AttendanceLogsModel::whereHas('user', function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            })
                ->whereDate('timestamp', $today)
                ->distinct('user_id')
                ->count('user_id');

            // On Leave Counter
            $attendance['onleave_count'] = ApplicationsModel::whereHas('user', function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            })
                ->where('status', 'Approved')
                ->whereDate('duration_start', '<=', $today)
                ->whereDate('duration_end', '>=', $today)
                ->distinct('user_id')
                ->count('user_id');

            return response()->json([
                'status' => 200,
                'counter' => $counter,
                'average' => $average,
                'attendance' => $attendance
            ]);
        }
    }
}
