<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Models\User;
use App\Models\HrEmployees;
use App\Models\HrWorkshifts;
use App\Models\HrWorkhour;
use App\Models\HrAttendance;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class MemberAttendanceController extends Controller
{
    // --------------- CALENDAR ATTENDANCE ---------------

    public function getCalendarAttendance()
    {
        Log::info("HrEmployeesController::getCalendarAttendance");

        $today = date('Y-m-d');
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $calendarEvents = DB::table('hr_workdays')
            ->select(DB::raw("
            hr_workdays.workday_id,
            hr_workdays.title,
            hr_workdays.start_date,
            hr_workdays.end_date,
            hr_workdays.color"))
            ->where('type', '=', 1)
            ->where('is_deleted', '=', 0)
            // ->where('team', '=', $user->team)
            ->where('hr_workshift_id', "=", $user->hr_workshift_id)
            ->get();

        $calendarApplication = DB::table('hr_workdays')
            ->select(DB::raw("
            hr_workdays.workday_id,
            hr_workdays.title,
            hr_workdays.status,
            hr_workdays.start_date,
            hr_workdays.end_date,
            hr_workdays.color"))
            ->where('type', '=', 5)
            ->where('is_deleted', '=', 0)
            ->where('user_id', '=', $userID)
            // ->where('team', '=', $user->team)
            ->where('hr_workshift_id', "=", $user->hr_workshift_id)
            ->get();

        $eventData = array();
        foreach ($calendarEvents as $events) {

            $attendance = DB::table('hr_attendance')
                ->select('*')
                ->where('user_id', $userID)
                ->where('workday_id', $events->workday_id)
                ->where('start_date', $events->start_date)
                ->first();

            $formatstartDate = date('Y-m-d', strtotime($events->start_date));
            $formatendDate = date('Y-m-d', strtotime($events->end_date));
            if ($formatstartDate < $today && !isset($attendance)) {
                $eventData[] = array(
                    'id' => $events->workday_id,
                    'title' => "Work Day (Absent)",
                    'start' => $formatstartDate,
                    'end' => $formatendDate,
                    'color' => '#eb3941'
                );
            } else {
                $eventData[] = array(
                    'id' => $events->workday_id,
                    'title' => $events->title,
                    'start' => $formatstartDate,
                    'end' => $formatendDate,
                    'color' => $events->color
                );
            }
        }

        foreach ($calendarApplication as $application) {
            $formatstartDate = date('Y-m-d', strtotime($application->start_date));
            $formatendDate = date('Y-m-d', strtotime($application->end_date));
            $eventData[] = array(
                'id' => $application->workday_id,
                'title' => $application->title . ' (' . $application->status . ')',
                'start' => $formatstartDate,
                'end' => $formatendDate,
                'color' => $application->color
            );
        }

        if ( $user->hr_workshift_id ) {
            return response()->json([
                'status' => 200,
                'events' => $eventData
            ]);
        } else {
            return response()->json([
                'status' => 200,
                'events' => NULL
            ]);
        }

        
    }

    public function getEmployeeWorkShift()
    {
        Log::info("MemberAttendanceController::getEmployeeWorkShift");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $shiftId = $user->hr_workshift_id;

        $workShift = HrWorkshifts::where('id', $shiftId)->first();
        $workHours = HrWorkhour::where('hr_workshift_id', $shiftId)->first();

        return response()->json([ 
            'status' => 200,
            'workShift' => $workShift,
            'workHours' => $workHours,
        ]);
    }
    
    public function AddTimeinAttendance(Request $request)
    {
        $today = date('Y-m-d');
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $validated = $request->validate([
            'timeIn' => 'required',
            'start' => 'required',
            'end' => 'required',
            'color' => 'required',
            'add_time_in' => 'required'
        ]);

        if ($validated) {
            $timeIn = $validated['timeIn'];
            $start = $validated['start'];
            $end = $validated['end'];
            $color = $validated['color'];
            $add_time_in = $validated['add_time_in'];
            
            try {
                $workday = DB::table('hr_workdays')
                    ->select('*')
                    ->where('start_date', $today)
                    ->where('type', 1)
                    ->where('is_deleted', 0)
                    ->where('team', $user->team)
                    ->where('hr_workshift_id', $user->hr_workshift_id)
                    ->first();

                $workhour = DB::table('hr_workhours')
                    ->select('*')
                    ->where('hr_workshift_id', $user->hr_workshift_id)
                    ->where('team', $user->team)
                    ->first();

                $insertData = [
                    'morning_in' => $request->input('timeIn'),
                    'start_date' => $request->input('start'),
                    'end_date' => $request->input('end'),
                    'color' => $request->input('color'),
                    'user_id' => $userID,
                    'type' => 1,
                    'status' => 'attendance',
                    'workday_id' => $workday->workday_id,
                    'hr_workshift_id' => $user->hr_workshift_id,
                ];

                if ($workhour->noon_break === 'No') {
                    $insertData['morning_out'] = Carbon::parse($today . ' ' . $workhour->hours_morning_out);
                    $insertData['afternoon_in'] = Carbon::parse($today . ' ' . $workhour->hours_afternoon_in);
                }

                $insertTimein = DB::table('hr_attendance')->insertGetId($insertData);
            } catch (\Exception $e) {
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $validated
        ]);
    }

    public function AddTimeoutAttendance(Request $request)
    {
        $today = date('Y-m-d');

        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $validated = $request->validate([
            'timeOut' => 'required',
            'start' => 'required',
            'end' => 'required',
            'color' => 'required',
            'morning_time_out' => 'required'
        ]);

        if ($validated) {
            $timeOut = $validated['timeOut'];
            $start = $validated['start'];
            $end = $validated['end'];
            $color = $validated['color'];
            $morning_time_out = $validated['morning_time_out'];

            try {
                $workday = DB::table('hr_workdays')
                    ->select('workday_id')
                    ->where('start_date', $today)
                    ->where('type', 1)
                    ->where('team', $user->team)
                    ->where('hr_workshift_id', $user->hr_workshift_id)
                    ->first();

                $attendance = DB::table('hr_attendance')
                    ->select('attdn_id')
                    ->where('user_id', $userID)
                    ->where('start_date', $request->input('start'))
                    ->where('workday_id', $workday->workday_id)
                    ->get();

                foreach ($attendance as $time) {
                    $updateResult = DB::table('hr_attendance')->where('attdn_id', $time->attdn_id)->update(['morning_out' => $request->input('timeOut'),'type' => 2,]);
                }

            } catch (\Exception $e) {
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $validated
        ]);
    }

    public function AddTimeinAfternoon(Request $request)
    {
        $today = date('Y-m-d');
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $validated = $request->validate([
            'timeIn' => 'required',
            'start' => 'required',
            'end' => 'required',
            'color' => 'required',
            'afternoon_time_in' => 'required'
        ]);

        if ($validated) {
            $timeIn = $validated['timeIn'];
            $start = $validated['start'];
            $end = $validated['end'];
            $color = $validated['color'];
            $afternoon_time_in = $validated['afternoon_time_in'];

            try {
                $workday = DB::table('hr_workdays')
                    ->select('workday_id')
                    ->where('start_date', $today)
                    ->where('type', 1)
                    ->where('team', $user->team)
                    ->where('hr_workshift_id', $user->hr_workshift_id)
                    ->first();

                $attendance = DB::table('hr_attendance')
                    ->select('attdn_id')
                    ->where('user_id', $userID)
                    ->where('start_date', $request->input('start'))
                    ->where('workday_id', $workday->workday_id)
                    ->get();

                foreach ($attendance as $time) {
                    $updateResult = DB::table('hr_attendance')->where('attdn_id', $time->attdn_id)->update(['afternoon_in' => $request->input('timeIn'),'type' => 3,]);
                }

            } catch (\Exception $e) {
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $validated
        ]);
    }

    public function AddTimeoutAfternoon(Request $request)
    {
        $today = date('Y-m-d');

        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $validated = $request->validate([
            'timeOut' => 'required',
            'start' => 'required',
            'end' => 'required',
            'color' => 'required',
            'afternoon_time_out' => 'required'
        ]);

        if ($validated) {
            $timeOut = $validated['timeOut'];
            $start = $validated['start'];
            $end = $validated['end'];
            $color = $validated['color'];
            $afternoon_time_out = $validated['afternoon_time_out'];

            try {
                $workday = DB::table('hr_workdays')
                    ->select('workday_id')
                    ->where('start_date', $today)
                    ->where('type', 1)
                    ->where('team', $user->team)
                    ->where('hr_workshift_id', $user->hr_workshift_id)
                    ->first();

                $attendance = DB::table('hr_attendance')
                    ->select('*')
                    ->where('user_id', $userID)
                    ->where('start_date', $request->input('start'))
                    ->where('workday_id', $workday->workday_id)
                    ->get();

                foreach ($attendance as $time) {
                    if ($time->morning_out > $request->input('timeOut')) {
                        $updateResult = DB::table('hr_attendance')->where('attdn_id', $time->attdn_id)->update(['morning_out' => $request->input('timeOut')]);
                    }

                    if ($time->afternoon_in > $request->input('timeOut')) {
                        $updateResult = DB::table('hr_attendance')->where('attdn_id', $time->attdn_id)->update(['afternoon_in' => $request->input('timeOut')]);
                    }

                    $updateResult = DB::table('hr_attendance')->where('attdn_id', $time->attdn_id)->update(['afternoon_out' => $request->input('timeOut'),'type' => 4]);
                }
            } catch (\Exception $e) {
            }
        }

        return response()->json([
            'status' => 200,
            'data' => $validated
        ]);
    }

    public function setgetTimeAttendance()
    {
        $year = date('Y');
        $month = date('m');
        $day = date('d');
        
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = User::where('user_id', $userID)->first();

        $attendance = DB::table('hr_attendance')
            ->select('*')
            ->where('user_id', $userID)
            ->where('hr_workshift_id', $user->hr_workshift_id)
            ->where('is_deleted', '0')
            ->whereRaw('YEAR(start_date) = ?', $year)
            ->whereRaw('MONTH(start_date) = ?', $month)
            ->whereRaw('DAY(start_date) = ?', $day)
            ->get();

        return response()->json(['attendance' => $attendance]);
    }

    public function getEmployeeAttendance(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = User::where('user_id', $userID)->first();
        $month = $request->input('month');
        $year = $request->input('year');
    
        $startDate = "{$year}-{$month}-01 00:00:00";
        $endDate = date('Y-m-t 23:59:59', strtotime($startDate));
    
        $employee = User::where('team', $user->team)->where('user_id', $request->input('employeeId'))->first();
        $attendances = HrAttendance::where('user_id', $employee->user_id)->whereBetween('start_date', [$startDate, $endDate])->where('is_deleted', 0)->orderBy('start_date')->get();
        $workShift = HrWorkshifts::find($employee->hr_workshift_id);
        
        return response()->json([
            'employee' => $employee,
            'attendances' => $attendances,
            'workShift' => $workShift,
            'workHours' => $workShift->workhour,
        ]);
    }
    
}