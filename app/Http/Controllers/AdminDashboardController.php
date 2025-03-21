<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\BranchesModel;
use App\Models\TrainingsModel;
use App\Models\ApplicationsModel;
use App\Models\AnnouncementsModel;
use App\Models\AttendanceLogsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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

    public function getDashboardData()
    {

        // Log::info("AdminDashboardController::getDashboardData");
        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;

            $counter = [];
            $average = [];
            $attendance = [];

            $today = Carbon::now();

            // ---- Counter Rows ---- //
            // Get Employees
            $employees = UsersModel::where('client_id', $clientId)->where('user_type', "Employee")->where('employment_status', "Active")->get();
            $counter['head_count'] = count($employees);

            // Get Applications
            $counter['application_count'] = ApplicationsModel::where('client_id', $clientId)->where('status', 'Pending')->count();

            // Get Announcements
            $counter['announcement_count'] = AnnouncementsModel::where('client_id', $clientId)->where('status', "Published")->count();

            // Get Trainings 
            $counter['training_count'] = TrainingsModel::where('client_id', $clientId)->where('status', 'Active')->count();

            // Average Age
            if ($employees->count() > 0) {
                $totalAge = 0;
                foreach ($employees as $employee) {
                    $birthDate = Carbon::parse($employee->birth_date);
                    $age = $today->diffInYears($birthDate) + ($today->diffInMonths($birthDate) % 12 / 12) + ($today->diffInDays($birthDate) % 30.42 / 365.25); // This gives the age with decimal precision

                    $totalAge += $age;
                }
                $average['age'] = round($totalAge / $employees->count(), 1);
            }

            // Average Tenureship
            if ($employees->count() > 0) {
                $totalTenure = 0;
                foreach ($employees as $employee) {
                    $hireDate = Carbon::parse($employee->date_start);
                    $tenureInYears = $today->diffInYears($hireDate) + ($today->diffInMonths($hireDate) % 12 / 12) + ($today->diffInDays($hireDate) % 30.42 / 365.25);

                    $totalTenure += $tenureInYears;
                }
                $average['tenure'] = round($totalTenure / $employees->count(), 1);
            }

            // ---- Attendance Pie Chart ---- //
            // Present Counter
            $attendance['present_count'] = AttendanceLogsModel::whereHas('user', function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            })->whereDate('timestamp', $today)->distinct('user_id')->count('user_id');

            // On Leave Counter
            $attendance['onleave_count'] = ApplicationsModel::whereHas('user', function ($query) use ($clientId) {
                $query->where('client_id', $clientId);
            })->where('status', 'Approved')->whereDate('duration_start', '<=', $today)->whereDate('duration_end', '>=', $today)->distinct('user_id')->count('user_id');

            // ---- Chart Row ---- //
            // Branch Employees
            $branches = [];
            $rawBranches = BranchesModel::select('id', 'name', 'acronym', 'client_id')->where('client_id', $clientId)->get();

            foreach ($rawBranches as $branch) {
                $employees = UsersModel::select('name')->where('user_type', "Employee")->where('employment_status', "Active")->where('branch_id', $branch->id)->count();

                $branches[] = ['name' => $branch->name, 'acronym' => $branch->acronym, 'employees' => $employees];
            }


            // Salary Range
            $salaryRange = [];

            $payRange1 = UsersModel::where('client_id', $clientId)
                ->where('user_type', "Employee")
                ->whereBetween(DB::raw('CASE 
                    WHEN salary_type = "Hourly" THEN salary * 160
                    WHEN salary_type = "Daily" THEN salary * 20
                    WHEN salary_type = "Weekly" THEN salary * 4
                    WHEN salary_type = "Bi-Monthly" THEN salary * 2
                    WHEN salary_type = "Monthly" THEN salary
                    ELSE 0 END'), [10000, 20000])
                ->count();

            $payRange2 = UsersModel::where('client_id', $clientId)
                ->where('user_type', "Employee")
                ->whereBetween(DB::raw('CASE 
                    WHEN salary_type = "Hourly" THEN salary * 160
                    WHEN salary_type = "Daily" THEN salary * 20
                    WHEN salary_type = "Weekly" THEN salary * 4
                    WHEN salary_type = "Bi-Monthly" THEN salary * 2
                    WHEN salary_type = "Monthly" THEN salary
                    ELSE 0 END'), [20001, 30000])
                ->count();

            $payRange3 = UsersModel::where('client_id', $clientId)
                ->where('user_type', "Employee")
                ->whereBetween(DB::raw('CASE 
                    WHEN salary_type = "Hourly" THEN salary * 160
                    WHEN salary_type = "Daily" THEN salary * 20
                    WHEN salary_type = "Weekly" THEN salary * 4
                    WHEN salary_type = "Bi-Monthly" THEN salary * 2
                    WHEN salary_type = "Monthly" THEN salary
                    ELSE 0 END'), [30001, 40000])
                ->count();

            $payRange4 = UsersModel::where('client_id', $clientId)
                ->where('user_type', "Employee")
                ->whereBetween(DB::raw('CASE 
                    WHEN salary_type = "Hourly" THEN salary * 160
                    WHEN salary_type = "Daily" THEN salary * 20
                    WHEN salary_type = "Weekly" THEN salary * 4
                    WHEN salary_type = "Bi-Monthly" THEN salary * 2
                    WHEN salary_type = "Monthly" THEN salary
                    ELSE 0 END'), [40001, 50000])
                ->count();

            $payRange5 = UsersModel::where('client_id', $clientId)
                ->where('user_type', "Employee")
                ->where(DB::raw('CASE 
                    WHEN salary_type = "Hourly" THEN salary * 160
                    WHEN salary_type = "Daily" THEN salary * 20
                    WHEN salary_type = "Weekly" THEN salary * 4
                    WHEN salary_type = "Bi-Monthly" THEN salary * 2
                    WHEN salary_type = "Monthly" THEN salary
                    ELSE 0 END'), '>', 50000)
                ->count();

            $salaryRange = [$payRange1, $payRange2, $payRange3, $payRange4, $payRange5];
            //Log::info($salaryRange);

            return response()->json([
                'status' => 200,
                'counter' => $counter,
                'average' => $average,
                'attendance' => $attendance,
                'branches' => $branches,
                'salary_range' => $salaryRange
            ]);
        }
    }

    public function getAttendance(Request $request)
    {
        //Log::info("AdminDashboardController::getAttendance");
        $user = Auth::user();
        $today = Carbon::now()->toDateString();

        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $type = $request->input('type', 1);

            $attendances = AttendanceLogsModel::whereHas('user', function ($query) use ($clientId) {
                $query->where('client_id', $clientId)->where('user_type', "Employee")->where('employment_status', "Active");
            })
                ->whereDate('timestamp', Carbon::now()->toDateString())
                ->with('user', 'workHour')
                ->get();

            $result = [];

            if ($type == 1) { // PRESENT
                $result = $attendances->groupBy('user_id')
                    ->sortKeysDesc()
                    ->map(function ($logs) {
                        $timeIn = $logs->firstWhere('action', 'Duty In');
                        $timeOut = $logs->last(function ($log) {
                            return $log->action === 'Duty Out';
                        });
                        $user = $logs->first()->user;

                        if ($user->profile_pic) {
                            $user->avatar = base64_encode(Storage::disk('public')->get($user->profile_pic));
                            $user->avatar_mime = mime_content_type(storage_path('app/public/' . $user->profile_pic));
                        } else {
                            $user->avatar = null;
                            $user->avatar_mime = null;
                        }

                        return [
                            'id' => $user->id,
                            'avatar' => $user->avatar,
                            'avatar_mime' => $user->avatar_mime,
                            'first_name' => $user->first_name ?? null,
                            'last_name' => $user->last_name ?? null,
                            'middle_name' => $user->middle_name ?? null,
                            'suffix' => $user->suffix ?? null,
                            'time_in' => $timeIn ? $timeIn->timestamp : null,
                            'time_out' => $timeOut ? $timeOut->timestamp : null,
                        ];
                    })
                    ->values()
                    ->all();

                usort($result, function ($a, $b) {
                    return $b['time_in'] <=> $a['time_in'] ?: 0;
                });
            } elseif ($type == 2) { // LATE
                $result = $attendances->groupBy('user_id')
                    ->map(function ($logs) {
                        $timeIn = $logs->firstWhere('action', 'Duty In');
                        $user = $logs->first()->user;
                        $workStart = $logs->first()->workHour->first_time_in;
                        $expectedStart = Carbon::parse($workStart);

                        $lateThreshold = $expectedStart->copy()->addMinute();

                        if ($user->profile_pic) {
                            $user->avatar = base64_encode(Storage::disk('public')->get($user->profile_pic));
                            $user->avatar_mime = mime_content_type(storage_path('app/public/' . $user->profile_pic));
                        } else {
                            $user->avatar = null;
                            $user->avatar_mime = null;
                        }

                        if ($timeIn && $workStart && Carbon::parse($timeIn->timestamp)->gt($lateThreshold)) {
                            $lateBy = Carbon::parse($timeIn->timestamp)->diffInSeconds(Carbon::parse($workStart));
                            return [
                                'id' => $user->id,
                                'avatar' => $user->avatar,
                                'avatar_mime' => $user->avatar_mime,
                                'first_name' => $user->first_name ?? null,
                                'last_name' => $user->last_name ?? null,
                                'middle_name' => $user->middle_name ?? null,
                                'suffix' => $user->suffix ?? null,
                                'time_in' => $timeIn->timestamp,
                                'start_time' => $expectedStart,
                                'late_by' => $lateBy,
                            ];
                        }
                        return null;
                    })
                    ->filter()
                    ->values()
                    ->all();

                usort($result, function ($a, $b) {
                    return $b['time_in'] <=> $a['time_in'] ?: 0;
                });
            } elseif ($type == 3) { // ABSENT
                $attendedUserIds = $attendances->pluck('user_id')->unique()->toArray();
                $onLeaveUserIds = ApplicationsModel::whereHas('user', function ($query) use ($clientId) {
                    $query->where('client_id', $clientId)->where('user_type', 'Employee')->where('employment_status', 'Active');
                })
                    ->where('status', 'Approved')
                    ->whereDate('duration_start', '<=', $today)
                    ->whereDate('duration_end', '>=', $today)
                    ->distinct('user_id')
                    ->pluck('user_id')
                    ->toArray();

                $allEmployees = UsersModel::where('client_id', $clientId)
                    ->where('user_type', 'Employee')
                    ->where('employment_status', 'Active')
                    ->pluck('id')
                    ->diff($attendedUserIds)
                    ->diff($onLeaveUserIds)
                    ->toArray();

                $result = UsersModel::whereIn('id', $allEmployees)
                    ->get()
                    ->map(function ($user) {
                        if ($user->profile_pic) {
                            $user->avatar = base64_encode(Storage::disk('public')->get($user->profile_pic));
                            $user->avatar_mime = mime_content_type(storage_path('app/public/' . $user->profile_pic));
                        } else {
                            $user->avatar = null;
                            $user->avatar_mime = null;
                        }
                        return [
                            'id' => $user->id,
                            'avatar' => $user->avatar,
                            'avatar_mime' => $user->avatar_mime,
                            'first_name' => $user->first_name ?? null,
                            'last_name' => $user->last_name ?? null,
                            'middle_name' => $user->middle_name ?? null,
                            'suffix' => $user->suffix ?? null,
                        ];
                    })
                    ->values()
                    ->all();
            } elseif ($type == 4) { // ON LEAVE
                $onLeaveApplications = ApplicationsModel::whereHas('user', function ($query) use ($clientId) {
                    $query->where('client_id', $clientId)->where('user_type', 'Employee')->where('employment_status', 'Active');
                })
                    ->where('status', 'Approved')
                    ->whereDate('duration_start', '<=', $today)
                    ->whereDate('duration_end', '>=', $today)
                    ->with('user', 'type')
                    ->get();

                $result = $onLeaveApplications->map(function ($application) {
                    $user = $application->user;
                    $typeName = $application->type ? $application->type->name : 'Unknown';
                    $startDate = Carbon::parse($application->duration_start);
                    $endDate = Carbon::parse($application->duration_end);

                    if ($user->profile_pic) {
                        $user->avatar = base64_encode(Storage::disk('public')->get($user->profile_pic));
                        $user->avatar_mime = mime_content_type(storage_path('app/public/' . $user->profile_pic));
                    } else {
                        $user->avatar = null;
                        $user->avatar_mime = null;
                    }

                    return [
                        'id' => $user->id,
                        'avatar' => $user->avatar,
                        'avatar_mime' => $user->avatar_mime,
                        'first_name' => $user->first_name ?? null,
                        'last_name' => $user->last_name ?? null,
                        'middle_name' => $user->middle_name ?? null,
                        'suffix' => $user->suffix ?? null,
                        'type_name' => $typeName,
                        'leave_start' => $startDate,
                        'leave_end' => $endDate,
                    ];
                })
                    ->values()
                    ->all();
            }

            return response()->json(['status' => 200, 'attendance' => $result]);
        } else {
            return response()->json(['status' => 200, 'attendance' => null]);
        }
    }
}
