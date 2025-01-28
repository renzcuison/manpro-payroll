<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\WorkHoursModel;
use App\Models\WorkGroupsModel;
use App\Models\WorkShiftsModel;
use App\Models\AttendanceLogsModel;

use App\Models\WorkDaysModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

use Carbon\Carbon;

class PayrollController extends Controller
{
    public function checkUser()
    {
        // Log::info("PayrollController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getNumberOfDays(Carbon $startDate, Carbon $endDate)
    {
        log::info("PayrollController::getNumberOfDays");

        // Initialize counters
        $numberOfDays = $startDate->diffInDays($endDate) + 1; // Include start and end date
        $numberOfSaturday = 0;
        $numberOfSunday = 0;
        $numberOfHoliday = 0;

        // Fetch Philippine holidays from Google Calendar API
        $holidays = $this->getGoogleCalendarHolidays($startDate, $endDate);

        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            // Check for Saturday or Sunday
            if ($currentDate->isSaturday()) {
                $numberOfSaturday++;
            } elseif ($currentDate->isSunday()) {
                $numberOfSunday++;
            }

            // Check if it's a holiday
            $holidayDate = $currentDate->format('Y-m-d'); // Format date as YYYY-MM-DD
            if (in_array($holidayDate, $holidays)) {
                $numberOfHoliday++;
            }

            // Move to the next day
            $currentDate->addDay();
        }

        // Return the results
        return [
            'numberOfDays' => $numberOfDays,
            'numberOfSaturday' => $numberOfSaturday,
            'numberOfSunday' => $numberOfSunday,
            'numberOfHoliday' => $numberOfHoliday,
        ];
    }

    public function getGoogleCalendarHolidays(Carbon $startDate, Carbon $endDate)
    {
        log::info("PayrollController::getGoogleCalendarHolidays");

        $apiKey = 'AIzaSyAPJ1Ua6xjhqwbjsucXeUCYYGUnObnJPU8';
        $calendarId = 'en.philippines#holiday@group.v.calendar.google.com';

        // Prepare the API endpoint to fetch holidays within the date range
        $startDateFormatted = $startDate->toIso8601String();
        $endDateFormatted = $endDate->toIso8601String();

        $url = "https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events";
        $url .= "?key={$apiKey}&timeMin={$startDateFormatted}&timeMax={$endDateFormatted}&singleEvents=true";

        // Make the API request
        $response = Http::get($url);

        if ($response->successful()) {
            $events = $response->json()['items'];
            $holidays = [];

            foreach ($events as $event) {
                // Extract the date of the holiday and add to the holidays array
                $holidayDate = Carbon::parse($event['start']['date'])->format('Y-m-d');
                $holidays[] = $holidayDate;
            }

            return $holidays;
        } else {
            Log::error("Failed to fetch Google Calendar holidays: " . $response->status());
            return [];
        }
    }

    public function payrollProcess(Request $request)
    {
        log::info("PayrollController::payrollProcess");
        log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {

            $request->validate([
                'startDate' => 'required|date',
                'endDate' => 'required|date|after_or_equal:startDate',
            ]);
    
            $startDate = $request->startDate;
            $endDate = $request->endDate;
    
            $employees = UsersModel::whereHas('attendanceLogs', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('timestamp', [$startDate, $endDate]);
            })->where('client_id', $user->client_id)->get();
    
            $payrolls = [];
    
            foreach ($employees as $employee) {

                $payrollLateAndAbsent = 0;

                $logs = AttendanceLogsModel::where('user_id', $employee->id)->whereBetween('timestamp', [$startDate, $endDate])->get();

                log::info($logs);

                $distinctDays = $logs->groupBy(function ($log) {
                    return \Carbon\Carbon::parse($log->timestamp)->toDateString();
                });
                
                $payrollDaysPresent = $distinctDays->count();

                $payrollData = $this->getNumberOfDays(Carbon::parse($startDate), Carbon::parse($endDate));

                log::info($payrollData);

                $payrolls[] = [
                    'id' => $employee->id,
                    'employeeName' => $employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->last_name . ' ' . $employee->suffix,
                    'employeeBranch' => $employee->branch->name ?? '-',
                    'employeeDepartment' => $employee->department->name ?? '-',
                    'employeeRole' => $employee->role->name ?? '-',
                    'employeeSalary' => $employee->salary,
                    'payrollDates' => $startDate  . ' - ' . $endDate,
                    'payrollDaysPresent' => $payrollDaysPresent,
                ];
            }
    
            return response()->json(['status' => 200, 'payrolls' => $payrolls]);
        }

        return response()->json(['status' => 200, 'payrolls' => null]);
    }
}
