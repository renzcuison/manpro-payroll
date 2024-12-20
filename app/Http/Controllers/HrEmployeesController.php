<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\HrEmployees;
use App\Models\HrWorkshifts;
use App\Models\HrWorkhour;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Mail\NewEmployeeMail;
use Carbon\Carbon;

class HrEmployeesController extends Controller
{
    // --------------- EMPLOYEES ---------------
    public function getEmployee($id)
    {
        // log::info("HrEmployeesController::getEmployee");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')->select('*')->where('user_id', $id)->first();

            $employee = User::where('is_deleted', '!=', 1)->where('user_type', 'Member')->where('team', $admin->team)->orderBy('lname', 'asc')->orderBy('fname', 'asc')->orderBy('mname', 'asc')->get();
            $evaluator = User::where('is_deleted', '!=', 1)->whereNotIn('user_type', ['Suspended'])->where('team', $admin->team)->orderBy('lname', 'asc')->orderBy('fname', 'asc')->orderBy('mname', 'asc')->get();
        } else {
            $employee = User::where('is_deleted', '!=', 1)->where('user_type', 'Member')->where('team', $user->team)
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
            $evaluator = User::where('is_deleted', '!=', 1)->whereNotIn('user_type', ['Suspended'])->where('team', $user->team)
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        }
        $monthToday = date('m');
        $yearToday = date('Y');

        $calendarEvents = DB::table('hr_workdays')
            ->select(DB::raw("
            hr_workdays.workday_id,
            hr_workdays.title,
            hr_workdays.start_date,
            hr_workdays.end_date,
            hr_workdays.color"))
            ->where('is_deleted', '=', 0)
            ->where('type', 1)
            ->where('team', $user->team)
            ->whereRaw('MONTH(start_date) = ?', $monthToday)
            ->whereRaw('YEAR(start_date) = ?', $yearToday)
            ->get();

        $workDays = count($calendarEvents);

        if ($user->user_type === 'Super Admin') {
            $daily = User::where('is_deleted', 0)->where('user_type', '=', 'Member')->get();
        } else {
            $daily = User::where('is_deleted', 0)->where('team', $user->team)->where('user_type', '=', 'Member')->get();
        }
        $user_id = [];
        $monthly_rate = [];
        foreach ($daily as $val) {
            $user_id[] = $val->user_id;
            $monthly_rate[] = $val->monthly_rate;
        }
        $count = 0;
        foreach ($daily as $drate) {
            if ($drate != null && $workDays != 0) {
                $totalDaily = $monthly_rate[$count] / $workDays;
                $totalHourly = $totalDaily / 8;
                User::where([["is_deleted", 0], ["user_id", $user_id[$count]]])->update(['work_days' => $workDays, 'daily_rate' => round($totalDaily), 'hourly_rate' => round($totalHourly)]);
            } else {
                User::where("is_deleted", 0)->update(['work_days' => $workDays]);
            }
            $count++;
        }

        return response()->json([
            'status' => 200,
            'employee' => $employee,
            'evaluator' => $evaluator
        ]);
    }

    public function getEmployeeHistory($id, $dates)
    {
        // log::info("HrEmployeesController::getEmployeeHistory");
        
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $recordsDate = explode(",", $dates);
        $monthRecord = $recordsDate[0];
        $yearRecord = $recordsDate[1];

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $employee = User::where('is_deleted', '!=', 1)->where('user_type', 'Member')->where('team', $admin->team)
                ->whereRaw('MONTH(date_created) = ?', [$monthRecord])
                ->whereRaw('YEAR(date_created) = ?', [$yearRecord])
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')->get();
        } else {
            $employee = User::where('is_deleted', '!=', 1)->where('user_type', 'Member')->where('team', $user->team)
                ->whereRaw('MONTH(date_created) = ?', [$monthRecord])
                ->whereRaw('YEAR(date_created) = ?', [$yearRecord])
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')->get();
        }

        return response()->json([
            'status' => 200,
            'employee' => $employee,
        ]);
    }

    public function getAdminEmployee()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $employee = User::where('is_deleted', '!=', 1)->where('user_type', 'Admin')->orderBy('date_created', 'ASC')->get();

        $monthToday = date('m');
        $yearToday = date('Y');

        $calendarEvents = DB::table('hr_workdays')
            ->select(DB::raw("
            hr_workdays.workday_id,
            hr_workdays.title,
            hr_workdays.start_date,
            hr_workdays.end_date,
            hr_workdays.color"))
            ->where('is_deleted', '=', 0)
            ->where('type', 1)
            ->where('team', $user->team)
            ->whereRaw('MONTH(start_date) = ?', $monthToday)
            ->whereRaw('YEAR(start_date) = ?', $yearToday)
            ->get();

        return response()->json([
            'status' => 200,
            'employee' => $employee,
            'workdays' => count($calendarEvents),
        ]);
    }

    public function searchEmployees(Request $request, $id)
    {
        $update_employee = User::find($id);
        return response()->json([
            'status' => 200,
            'update_employee' => $update_employee
        ]);
    }

    public function addEmployee(Request $request)
    {
        $employees = new HrEmployees();
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = $file->getClientOriginalName();
            $finalName = date('His') . $filename;
            $employees->photo = $request->file('image')->storeAs('images', $finalName, 'public');
            $employees->firstname = $request->input('firstname');
            $employees->lastname = $request->input('lastname');
            $employees->position = $request->input('position');
            $employees->rate = $request->input('rate');
            $employees->birth_date = $request->input('birth_date');
            $employees->email = $request->input('email');
            $employees->contact_number = $request->input('contact_number');
            $employees->address = $request->input('address');
            $employees->save();
            return response()->json([
                'status' => 200,
                'message' => 'Employee Added Successfully'
            ]);
        }
        return response()->json([
            'status' => 200,
            'message' => 'Error Adding of Employee'
        ]);
    }

    public function editEmployee(Request $request, $id)
    {
        $today = date('Y-m-d H:i:s');
        $data = $request->validate([
            'fname' => 'nullable|string|max:255',
            'mname' => 'nullable|string|max:255',
            'lname' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'bdate' => 'nullable',
            'user_type' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'hourly_rate'  => 'nullable|regex:/^\d+(\.\d{1,2})?$/',
            'daily_rate'  => 'nullable|regex:/^\d+(\.\d{1,2})?$/',
            'monthly_rate'  => 'nullable|integer',
            'work_days'  => 'nullable|integer',
            'department'  => 'nullable|string|max:255',
            'category'  => 'nullable|string|max:255',
            'bank'  => 'nullable|string|max:255',
            'date_hired'  => 'nullable',
            'sss'  => 'nullable',
            'philhealth'  => 'nullable',
            'pagibig'  => 'nullable',
            'atm'  => 'nullable'
        ]);

        $user = DB::table('user')->select('*')->where('user_id', $id)->first();

        if ($user->monthly_rate < $data['monthly_rate']) {
            $increase = DB::table('hr_salary_increase')->insert([
                'user_id' => $id,
                'from_rate' => $user->monthly_rate,
                'new_rate' => $data['monthly_rate'],
                'team' => $user->team,
                'created_at' => $today,
            ]);
        }

        $isUpdated = User::where('user_id', $id)->update($data);

        $benefitsList = DB::table('hr_employee_benefits_list')
            ->select('*')
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->get();

        foreach ($benefitsList as $list) {

            $existingRecord = DB::table('hr_employee_benefits')
                ->where('emp_id', $id)
                ->where('benefitlist_id', $list->benefitlist_id)
                ->where('is_deleted', 0)
                ->first();

            if ($existingRecord) {
                if ($list->chooseType === 'Percentage') {
                    $percent = $list->percentage / 100;
                    $percentRate = $percent * $data['monthly_rate'];

                    DB::table('hr_employee_benefits')
                        ->where('emp_id', $id)
                        ->where('benefitlist_id', $list->benefitlist_id)->update([
                            'description' => $list->title,
                            'amount' => $percentRate,
                            'type' => $list->type,
                            'created_At' => $today,
                            'team' => $user->team
                        ]);
                } else if ($list->chooseType === 'Amount') {

                    DB::table('hr_employee_benefits')
                        ->where('emp_id', $id)
                        ->where('benefitlist_id', $list->benefitlist_id)->update([
                            'description' => $list->title,
                            'amount' => $list->amount,
                            'type' => $list->type,
                            'created_At' => $today,
                            'team' => $user->team
                        ]);
                } else {

                    $benefitSum = DB::table('hr_employee_benefits')
                        ->join('hr_employee_benefits_list', 'hr_employee_benefits_list.benefitlist_id', '=', 'hr_employee_benefits.benefitlist_id')
                        ->where('hr_employee_benefits_list.is_deleted', 0)
                        ->where('hr_employee_benefits_list.team', $user->team)
                        ->where('hr_employee_benefits_list.title', '!=', 'INSURANCE')
                        ->where('hr_employee_benefits_list.type', 3)
                        ->where('hr_employee_benefits.emp_id', $id)
                        ->where('hr_employee_benefits.isupdate', 0)
                        ->where('hr_employee_benefits.is_deleted', 0)
                        ->sum('hr_employee_benefits.amount');

                    $bracketsList = DB::table('hr_employee_benefit_brackets')
                        ->select('*')
                        ->where('benefit_id', $list->benefitlist_id)
                        ->get();

                    if ($list->type === 4) {
                        foreach ($bracketsList as $bracket) {
                            switch ($list->chooseType) {
                                case 'Daily':
                                    $rate = $data['daily_rate'] - (($benefitSum ? $benefitSum : 0) / $data['work_days']);
                                    break;
                                case 'Weekly':
                                    $rate = ($data['daily_rate'] * ($data['work_days'] / 4)) - (($benefitSum ? $benefitSum : 0) / 4);
                                    break;
                                case 'Semi-Monthly':
                                    $rate = ($data['monthly_rate'] - ($benefitSum ? $benefitSum : 0)) / 2;
                                    break;
                                case 'Monthly':
                                    $rate = $data['monthly_rate'] - ($benefitSum ? $benefitSum : 0);
                                    break;
                            }
                            if ($rate >= $bracket->rangeFrom && $rate <= $bracket->rangeTo) {
                                $percent = $bracket->share / 100;
                                $diff = $rate - $bracket->rangeFrom;
                                $diffPercent = $diff * $percent;
                                $tax = $bracket->shareAmount + $diffPercent;

                                DB::table('hr_employee_benefits')
                                    ->where('emp_id', $id)
                                    ->where('benefitlist_id', $list->benefitlist_id)->update([
                                        'description' => $list->title,
                                        'amount' => $tax,
                                        'type' => $list->type,
                                        'created_At' => $today,
                                        'team' => $user->team,
                                        'taxable' => $diff,
                                        'exempt' => $bracket->rangeFrom
                                    ]);
                            }
                        }
                    } else {
                        foreach ($bracketsList as $bracket) {
                            if ($data['monthly_rate'] >= $bracket->rangeFrom && $data['monthly_rate'] <= $bracket->rangeTo) {
                                $percent = $bracket->share / 100;
                                $percentRate = $percent * $data['monthly_rate'];

                                DB::table('hr_employee_benefits')
                                    ->where('emp_id', $id)
                                    ->where('benefitlist_id', $list->benefitlist_id)->update([
                                        'description' => $list->title,
                                        'amount' => $percentRate,
                                        'type' => $list->type,
                                        'created_At' => $today,
                                        'team' => $user->team
                                    ]);
                            }
                        }
                    }
                }
            } else {
                if ($list->chooseType === 'Percentage') {
                    $percent = $list->percentage / 100;
                    $percentRate = $percent * $data['monthly_rate'];

                    DB::table('hr_employee_benefits')->insert([
                        'description' => $list->title,
                        'amount' => $percentRate,
                        'type' => $list->type,
                        'created_At' => $today,
                        'benefitlist_id' => $list->benefitlist_id,
                        'emp_id' => $id,
                        'team' => $user->team
                    ]);
                } else if ($list->chooseType === 'Amount') {

                    DB::table('hr_employee_benefits')->insert([
                        'description' => $list->title,
                        'amount' => $list->amount,
                        'type' => $list->type,
                        'created_At' => $today,
                        'benefitlist_id' => $list->benefitlist_id,
                        'emp_id' => $id,
                        'team' => $user->team
                    ]);
                } else {

                    $benefitSum = DB::table('hr_employee_benefits')
                        ->join('hr_employee_benefits_list', 'hr_employee_benefits_list.benefitlist_id', '=', 'hr_employee_benefits.benefitlist_id')
                        ->where('hr_employee_benefits_list.is_deleted', 0)
                        ->where('hr_employee_benefits_list.team', $user->team)
                        ->where('hr_employee_benefits_list.title', '!=', 'INSURANCE')
                        ->where('hr_employee_benefits_list.type', 3)
                        ->where('hr_employee_benefits.emp_id', $id)
                        ->where('hr_employee_benefits.isupdate', 0)
                        ->where('hr_employee_benefits.is_deleted', 0)
                        ->sum('hr_employee_benefits.amount');

                    $bracketsList = DB::table('hr_employee_benefit_brackets')
                        ->select('*')
                        ->where('benefit_id', $list->benefitlist_id)
                        ->get();

                    if ($list->type === 4) {
                        foreach ($bracketsList as $bracket) {
                            switch ($list->chooseType) {
                                case 'Daily':
                                    $rate = $data['daily_rate'] - (($benefitSum ? $benefitSum : 0) / $data['work_days']);
                                    break;
                                case 'Weekly':
                                    $rate = ($data['daily_rate'] * ($data['work_days'] / 4)) - (($benefitSum ? $benefitSum : 0) / 4);
                                    break;
                                case 'Semi-Monthly':
                                    $rate = ($data['monthly_rate'] - ($benefitSum ? $benefitSum : 0)) / 2;
                                    break;
                                case 'Monthly':
                                    $rate = $data['monthly_rate'] - ($benefitSum ? $benefitSum : 0);
                                    break;
                            }
                            if ($rate >= $bracket->rangeFrom && $rate <= $bracket->rangeTo) {
                                $percent = $bracket->share / 100;
                                $diff = $rate - $bracket->rangeFrom;
                                $diffPercent = $diff * $percent;
                                $tax = $bracket->shareAmount + $diffPercent;

                                DB::table('hr_employee_benefits')->insert([
                                    'description' => $list->title,
                                    'amount' => $tax,
                                    'type' => $list->type,
                                    'created_At' => $today,
                                    'benefitlist_id' => $list->benefitlist_id,
                                    'emp_id' => $id,
                                    'team' => $user->team,
                                    'taxable' => $diff,
                                    'exempt' => $bracket->rangeFrom
                                ]);
                            }
                        }
                    } else {
                        foreach ($bracketsList as $bracket) {
                            if ($data['monthly_rate'] >= $bracket->rangeFrom && $data['monthly_rate'] <= $bracket->rangeTo) {
                                $percent = $bracket->share / 100;
                                $percentRate = $percent * $data['monthly_rate'];

                                DB::table('hr_employee_benefits')->insert([
                                    'description' => $list->title,
                                    'amount' => $percentRate,
                                    'type' => $list->type,
                                    'created_At' => $today,
                                    'benefitlist_id' => $list->benefitlist_id,
                                    'emp_id' => $id,
                                    'team' => $user->team
                                ]);
                            }
                        }
                    }
                }
            }
        }

        $employee = DB::table('user')
            ->select('*')
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->where('user_type', 'Member')
            ->get();

        $appList = DB::table('hr_application_list')
            ->select('*')
            ->where('team', $user->team)
            ->where('is_deleted', 0)
            ->get();

        foreach ($employee as $emp) {
            foreach ($appList as $list) {
                $existingRecord = DB::table('hr_application_leave')
                    ->where('appList_id', $list->applist_id)
                    ->where('user_id', $emp->user_id)
                    ->exists();

                if (!$existingRecord) {
                    $insert_leave = DB::table('hr_application_leave')->insert(
                        array(
                            'appList_id' => $list->applist_id,
                            'user_id' => $emp->user_id,
                            'title' => $list->list_name,
                            'team' => $user->team,
                            'created_at' => $today,
                        )
                    );
                }
            }
        }

        $updateUserShift = User::where('user_id', $user->user_id)->first();

        log::info($request->input('hr_workshift_id'));
        log::info($updateUserShift);

        if ($updateUserShift) {
            $updateUserShift->hr_workshift_id = $request->input('hr_workshift_id');
            $updateUserShift->save();
        }

        return response()->json([
            'status' => 200,
            'message' => 'Update successful'
        ]);
    }

    public function deleteEmployee(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $delUser = $request->validate([
            'id' => 'required',
        ]);
        try {
            DB::table('user')->where('user_id', '=', $delUser)->update(['is_deleted' => 1, 'deleted_by' => $userID, 'email' => '']);
            $delete_leave = DB::table('hr_application_leave')->where('user_id', $delUser)->delete();
            $message = 'Success';
            return response()->json([
                'status' => 200,
                'message' => $message
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 200,
                'message' => $e
            ]);
        }
    }
    // --------------- END EMPLOYEES ---------------


    // --------------- CALENDAR WORKDAYS ---------------
    public function getWorkShift(Request $request)
    {
        $workShift = HrWorkshifts::where('id', $request->shiftId)->first();
        $workHours = HrWorkhour::where('hr_workshift_id', $request->shiftId)->first();

        $employees = User::where('is_deleted', '!=', 1)->where('hr_workshift_id', $request->shiftId)->whereNotIn('user_type', ['Suspended'])->where('user_type', 'Member')->get();

        return response()->json([ 
            'status' => 200,
            'workShift' => $workShift,
            'workHours' => $workHours,
            'employees' => $employees,
        ]);
    }

    public function getWorkShifts()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user       = User::where('user_id', $userID)->first();
        $workShifts = HrWorkshifts::where('team', $user->team)->where('is_deleted', 0)->get();

        foreach ($workShifts as $workShift) {
            $workHour = $workShift->workhour;

            $employeeCount = $workShift->user->count();
            $type = $workHour->noon_break;
            $hours = "";

            if ( $type == "Yes" ) {
                $morning_in = Carbon::createFromFormat('H:i:s', $workHour->hours_morning_in)->format('g:i A');
                $morning_out = Carbon::createFromFormat('H:i:s', $workHour->hours_morning_out)->format('g:i A');
                $afternoon_in = Carbon::createFromFormat('H:i:s', $workHour->hours_afternoon_in)->format('g:i A');
                $afternoon_out = Carbon::createFromFormat('H:i:s', $workHour->hours_afternoon_out)->format('g:i A');

                $hours = $morning_in . " - " . $morning_out . " | " . $afternoon_in . " - " . $afternoon_out;
            } else if ( $type == "No" ) {
                $morning_in = Carbon::createFromFormat('H:i:s', $workHour->hours_morning_in)->format('g:i A');
                $afternoon_out = Carbon::createFromFormat('H:i:s', $workHour->hours_afternoon_out)->format('g:i A');

                $hours = $morning_in . " - " . $afternoon_out;
            }

            $workShift->employeeCount = $employeeCount;
            $workShift->type = $type;
            $workShift->hours = $hours;
        }

        return response()->json([
            'status' => 200,
            'workShifts' => $workShifts
        ]);
    }

    public function saveWorkShift(Request $request)
    {
        try {
            DB::beginTransaction();

            if (Auth::check()) {
                $userID = Auth::id();
            } else {
                $userID = null;
            }

            $user = User::where('user_id', $userID)->first();

            $newWorkShift = HrWorkshifts::create([
                "client_id" => null,
                "team"   => $user->team,
                "description"   => $request->shiftName,
            ]);

            if ( $request->shiftType == 'regular' ) {
                $newWorkHour = HrWorkhour::create([
                    "morning_label" => $request->firstLabel,
                    "hours_morning_in" => date('H:i:s', strtotime($request->shiftTime['regular_time_in'])),
                    "hours_morning_out" => date('H:i:s', strtotime($request->shiftTime['regular_time_in']) + 1),
                    "afternoon_label" => Null,
                    "hours_afternoon_in" => date('H:i:s', strtotime($request->shiftTime['regular_time_out']) - 1),
                    "hours_afternoon_out" => date('H:i:s', strtotime($request->shiftTime['regular_time_out'])),
                    "noon_break" => "No",
                    "team" => $user->team,
                    "hr_workshift_id" => $newWorkShift->id,
                ]);
            } else if ( $request->shiftType == 'split') {
                $newWorkHour = HrWorkhour::create([
                    "morning_label" => $request->firstLabel,
                    "hours_morning_in" => date('H:i:s', strtotime($request->shiftTime['split_first_time_in'])),
                    "hours_morning_out" => date('H:i:s', strtotime($request->shiftTime['split_first_time_out'])),
                    "afternoon_label" => $request->secondLabel,
                    "hours_afternoon_in" => date('H:i:s', strtotime($request->shiftTime['split_second_time_in'])),
                    "hours_afternoon_out" => date('H:i:s', strtotime($request->shiftTime['split_second_time_out'])),
                    "noon_break" => "Yes",
                    "team" => $user->team,
                    "hr_workshift_id" => $newWorkShift->id,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving work shift: " . $e->getMessage());

            throw $e;
        }
    }

    public function editWorkShift(Request $request)
    {
        try {
            DB::beginTransaction();

            $userID = Auth::check() ? Auth::id() : null;

            $workShift = HrWorkshifts::where('id', $request->shiftId)->firstOrFail();
            $workHours = HrWorkhour::where('hr_workshift_id', $request->shiftId)->firstOrFail();

            $workShift->description = $request->shiftName;
            $workShift->save();

            if ( $workHours->noon_break === "Yes" ) {
                $workHours->morning_label = $request->firstLabel;
                $workHours->afternoon_label = $request->secondLabel;
                $workHours->hours_morning_in = $request->shiftTime['split_first_time_in'];
                $workHours->hours_morning_out = $request->shiftTime['split_first_time_out'];
                $workHours->hours_afternoon_in = $request->shiftTime['split_second_time_in'];
                $workHours->hours_afternoon_out = $request->shiftTime['split_second_time_out'];
                $workHours->save();
            } else if ( $workHours->noon_break === "No" ) {
                $workHours->morning_label = $request->firstLabel;
                $workHours->afternoon_label = Null;
                $workHours->hours_morning_in = date('H:i:s', strtotime($request->shiftTime['regular_time_in']));
                $workHours->hours_morning_out = date('H:i:s', strtotime($request->shiftTime['regular_time_in']) + 1);
                $workHours->hours_afternoon_in = date('H:i:s', strtotime($request->shiftTime['regular_time_out']) - 1);
                $workHours->hours_afternoon_out = date('H:i:s', strtotime($request->shiftTime['regular_time_out']));
                $workHours->save();
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update work shift.', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json(['error' => 'Unable to update work shift.'], 500);
        }
    }

    public function deleteWorkShift(Request $request)
    {
        try {
            DB::beginTransaction();

            $userID = Auth::check() ? Auth::id() : null;

            $workShift = HrWorkshifts::where('id', $request->shiftId)->firstOrFail();

            $workShift->is_deleted = 1;
            $workShift->save();

            DB::commit();

            Log::info('Work shift deleted successfully.', ['workShift' => $workShift]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update work shift.', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json(['error' => 'Unable to update work shift.'], 500);
        }
    }

    public function getWorkShiftEmployees(Request $request)
    {
        $employees = User::where('hr_workshift_id', $request->shiftId)->get();

        return response()->json([ 
            'status' => 200,
            'employees' => $employees,
        ]);
    }

    public function getCalendarEvents($id, $shiftId)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')->select('*')->where('user_id', $id)->first();

            $calendarEvents = DB::table('hr_workdays')
                ->select(DB::raw("hr_workdays.workday_id, hr_workdays.title, hr_workdays.start_date, hr_workdays.end_date, hr_workdays.color"))
                ->where('type', '=', 1)
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $admin->team)
                ->get();
        } else {
            $calendarEvents = DB::table('hr_workdays')
                ->select(DB::raw("hr_workdays.workday_id, hr_workdays.title, hr_workdays.start_date, hr_workdays.end_date, hr_workdays.color"))
                ->where('type', '=', 1)
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $user->team)
                ->where('hr_workshift_id', '=', $shiftId)
                ->get();
        }

        $eventData = array();
        foreach ($calendarEvents as $events) {
            $formatstartDate = date('Y-m-d', strtotime($events->start_date));
            $formatendDate = date('Y-m-d', strtotime($events->end_date));
            $eventData[] = array(
                'id' => $events->workday_id,
                'title' => $events->title,
                'start' => $formatstartDate,
                'end' => $formatendDate,
                'color' => $events->color
            );
        }

        $workhours = DB::table('hr_workhours')->select('*')->where('team', '=', $user->team)->orderBy('hour_id', 'desc')->first();

        $hoursData = null;

        if ($workhours) {
            $hoursData = (new Carbon($workhours->hours_morning_in))->format('h A') . ' - ' . (new Carbon($workhours->hours_afternoon_out))->format('h A');
        }

        return response()->json([
            'status' => 200,
            'events' => $eventData,
            'hours' => $hoursData
        ]);
    }

    public function addCalendarEvent(Request $request)
    {
        $data = $request->validate([
            'title' => 'required',
            'start' => 'required',
            'end' => 'required',
            'color' => 'required',
            'shiftId' => 'required',
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $workHours = DB::table('hr_workhours')->select('*')->where('team', $userTeam->team)->orderBy('hour_id', 'desc')->first();
        $workShift = HrWorkshifts::find($data['shiftId']);

        $start_dates = $data['start'];
        $end_dates = $data['end'];
        $count_dates = 0;
        foreach ($start_dates as $dates) {
            $insert_event = DB::table('hr_workdays')->insert(
                array(
                    'title' => $data['title'],
                    'start_date' => $dates,
                    'end_date' => $end_dates[$count_dates],
                    'color' => $data['color'],
                    'type' => 1,
                    'team' => $userTeam->team,
                    'hour_id' => $workHours->hour_id,
                    'hr_workshift_id' => $workShift->id,
                )
            );
            $count_dates++;
        }

        $monthToday = date('m');
        $yearToday = date('Y');
        $user_data = array();

        if ($insert_event == true) {
            $workDays = DB::table('hr_workdays')
                ->select(DB::raw("
                hr_workdays.workday_id,
                hr_workdays.title,
                hr_workdays.start_date,
                hr_workdays.end_date,
                hr_workdays.color"))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $userTeam->team)
                ->where('type', '=', 1)
                ->whereRaw('MONTH(start_date) = ?', $monthToday)
                ->whereRaw('YEAR(start_date) = ?', $yearToday)
                ->get();

            $userDetails = DB::table('user')
                ->select(DB::raw("
                user.user_id,
                user.hourly_rate,
                user.daily_rate,
                user.monthly_rate,
                user.work_days"))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $userTeam->team)
                ->get();
            foreach ($userDetails as $userlist) {
                if ($userlist->monthly_rate != null) {
                    $user_id = $userlist->user_id;
                    $totalwkdays = count($workDays);
                    $drate = $userlist->monthly_rate / $totalwkdays;
                    $hrate = $drate / 8;
                    // $user_data[] = [$drate, $hrate,  $userlist->monthly_rate, $totalwkdays];
                    DB::table('user')->where('user_id', '=', $user_id)->update(
                        array(
                            'work_days' => $totalwkdays,
                            'daily_rate' => $drate,
                            'hourly_rate' => $hrate
                        )
                    );
                }
            }
            $message = "Success";
        } else {
            $message = "Error";
        }

        return response()->json([
            'status' => 200,
            'message' => $message,
            // 'countDays' => $user_data
        ]);
    }

    public function deleteCalendarEvent(Request $request)
    {
        $data = $request->validate([
            'eventID' => 'required|integer',
        ]);
        $delete_event = DB::table('hr_workdays')->where('workday_id', $data['eventID'])->delete();
        $user_data = array();
        if ($delete_event) {
            $deleteDetails = DB::table('user')
                ->select(DB::raw("
                    user.user_id,
                    user.hourly_rate,
                    user.daily_rate,
                    user.monthly_rate,
                    user.work_days"))
                ->where('is_deleted', '=', 0)
                ->get();

            foreach ($deleteDetails as $userlist) {
                if ($userlist->monthly_rate != null) {
                    $userID = $userlist->user_id;
                    $totalwkdays = $userlist->work_days;
                    $wkdays = $totalwkdays - 1;
                    $mrate = $userlist->monthly_rate;
                    $drate = $mrate / $wkdays;
                    $hrate = $drate / 8;
                    $user_data[] = [$drate, $hrate,  $mrate, $wkdays];

                    DB::table('user')->where('user_id', '=', $userID)->update(
                        array(
                            'work_days' => $wkdays,
                            'daily_rate' => $drate,
                            'hourly_rate' => $hrate
                        )
                    );
                }
            }
            $message = "Success";
        } else {
            $message = "Error";
        }



        return response()->json([
            'status' => 200,
            'deleteData' => $message
        ]);
    }
    // --------------- END CALENDAR WORKDAYS ---------------

    // --------------- BENEFITS ---------------
    public function addBenefits(Request $request)
    {
        $data = $request->validate([
            'benefitlist_id' => 'required',
            'amount' => 'required',
            'type' => 'required',
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $benefitsData = DB::table("hr_employee_benefits_list")->where('team', $user->team)->where("benefitlist_id", $data['benefitlist_id'])->get();
        foreach ($benefitsData as $val) {
            $addAttendance = DB::table('hr_employee_benefits')->insert([
                'description' => $val->title,
                'team' => $val->team,
                'amount' => $data['amount'],
                'type' => $data['type'],
                'benefitlist_id' => $data['benefitlist_id']
            ]);
        }
        if ($addAttendance) {
            $message = "Success";
        } else {
            $message = "Failed";
        }
        return response()->json([
            'status' => 200,
            'benefits' => $message,
            'test' => $message
        ]);
    }

    public function getBenefits()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $benefitsData = DB::table("hr_employee_benefits")->where("type", 1)->where('team', $user->team)->get();
        return response()->json([
            'status' => 200,
            'benefits' => $benefitsData
        ]);
    }

    public function deletebenefits(Request $request)
    {
        $deleteBenefits = $request->validate([
            'benefits_id' => 'required'
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $benefitsDel = DB::table("hr_employee_benefits")->where('team', $user->team)->where('benefits_id', $deleteBenefits)->delete();

        if ($benefitsDel) {
            return response()->json([
                'status' => 200,
                'message' => 'Benefits has been removed'
            ]);
        } else {
            return response()->json([
                'message' => 'Error'
            ], 404);
        }
    }

    public function addLoans(Request $request)
    {
        $data = $request->validate([
            'benefitlist_id' => 'required',
            'amount' => 'required',
            'type' => 'required',
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $loanData = DB::table("hr_employee_benefits_list")->where('team', $user->team)->where("benefitlist_id", $data['benefitlist_id'])->get();
        foreach ($loanData as $val) {
            $addAttendance = DB::table('hr_employee_benefits')->insert([
                'description' => $val->title,
                'team' => $val->team,
                'amount' => $data['amount'],
                'type' => $data['type'],
                'benefitlist_id' => $data['benefitlist_id']
            ]);
        }

        if ($addAttendance) {
            $message = "Success";
        } else {
            $message = "Failed";
        }
        return response()->json([
            'status' => 200,
            'benefits' => $message
        ]);
    }

    public function getLoans()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $loansData = DB::table("hr_employee_benefits")->where('team', $user->team)->where("type", 2)->get();
        return response()->json([
            'status' => 200,
            'loans' => $loansData
        ]);
    }

    public function deleteLoans(Request $request)
    {
        $deleteLoans = $request->validate([
            'benefits_id' => 'required'
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $loansDel = DB::table("hr_employee_benefits")->where('team', $user->team)->where('benefits_id', $deleteLoans)->delete();

        if ($loansDel) {
            return response()->json([
                'status' => 200,
                'message' => 'loans has been removed'
            ]);
        } else {
            return response()->json([
                'message' => 'Error'
            ], 404);
        }
    }

    public function getContribution()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $ContributionData = DB::table("hr_employee_benefits")->where('team', $user->team)->where("type", 3)->get();
        return response()->json([
            'status' => 200,
            'contribution' => $ContributionData
        ]);
    }

    public function addContribution(Request $request)
    {
        $data = $request->validate([
            'benefitlist_id' => 'required',
            'amount' => 'required',
            'type' => 'required',
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $contriData = DB::table("hr_employee_benefits_list")->where('team', $user->team)->where("benefitlist_id", $data['benefitlist_id'])->get();
        foreach ($contriData as $val) {
            $addAttendance = DB::table('hr_employee_benefits')->insert([
                'description' => $val->title,
                'team' => $val->team,
                'amount' => $data['amount'],
                'type' => $data['type'],
                'benefitlist_id' => $data['benefitlist_id']
            ]);
        }

        if ($addAttendance) {
            $message = "Success";
        } else {
            $message = "Failed";
        }
        return response()->json([
            'status' => 200,
            'benefits' => $message
        ]);
    }

    public function deleteContribution(Request $request)
    {
        $deleteContribution = $request->validate([
            'benefits_id' => 'required'
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $ContributionDel = DB::table("hr_employee_benefits")->where('team', $user->team)->where('benefits_id', $deleteContribution)->delete();

        if ($ContributionDel) {
            return response()->json([
                'status' => 200,
                'message' => 'Contribution has been removed'
            ]);
        } else {
            return response()->json([
                'message' => 'Error'
            ], 404);
        }
    }
    // --------------- END BENEFITS ---------------

    // --------------- BENEFITS LIST ---------------
    public function AddAdditionalbenefits(Request $request)
    {
        $today = date('Y-m-d H:i:s');
        $data = $request->validate([
            'title' => 'required',
            'type' => 'required',
            'chooseType' => 'nullable',
            'percentage' => 'nullable',
            'amount' => 'nullable',
            'emp_id' => 'nullable',
            'chooseCutoff' => 'nullable',
            'benefitlist_id' => 'nullable',
            'amountTotal' => 'nullable'
        ]);

        $userID = Auth::id();
        $userTeam = DB::table('user')->select('*')->where('user_id', $userID)->first();

        try {
            if ($request->input('type') !== 5) {
                $benefitID = DB::table("hr_employee_benefits_list")->insertGetId(
                    array_merge($data, ['team' => $userTeam->team])
                );

                if ($request->has('brackets')) {
                    // Insert 'brackets' data into the 'brackets' table
                    $brackets = $request->input('brackets');
                    if ($request->input('type') === 4) {
                        foreach ($brackets as $bracket) {
                            DB::table('hr_employee_benefit_brackets')->insert([
                                'benefit_id' => $benefitID,
                                'rangeFrom' => $bracket['rangeFrom'],
                                'rangeTo' => $bracket['rangeTo'],
                                'share' => $bracket['share'],
                                'shareAmount' => $bracket['shareAmount'],
                            ]);
                        }
                    } else {
                        foreach ($brackets as $bracket) {
                            DB::table('hr_employee_benefit_brackets')->insert([
                                'benefit_id' => $benefitID,
                                'rangeFrom' => $bracket['rangeFrom'],
                                'rangeTo' => $bracket['rangeTo'],
                                'share' => $bracket['share'],
                            ]);
                        }
                    }
                }

                $users = DB::table('user')->select('*')->where('team', $userTeam->team)->where('user_Type', 'Member')->get();

                foreach ($users as $user) {
                    if ($request->input('chooseType') === 'Percentage') {
                        $percent = $request->input('percentage') / 100;
                        $percentRate = $percent * $user->monthly_rate;

                        DB::table('hr_employee_benefits')->insert([
                            'description' => $request->input('title'),
                            'amount' => $percentRate,
                            'type' => $request->input('type'),
                            'created_At' => $today,
                            'benefitlist_id' => $benefitID,
                            'emp_id' => $user->user_id,
                            'team' => $user->team
                        ]);
                    } else if ($request->input('chooseType') === 'Amount') {

                        DB::table('hr_employee_benefits')->insert([
                            'description' => $request->input('title'),
                            'amount' => $request->input('amount'),
                            'type' => $request->input('type'),
                            'created_At' => $today,
                            'benefitlist_id' => $benefitID,
                            'emp_id' => $user->user_id,
                            'team' => $user->team
                        ]);
                    } else {

                        $benefitSum = DB::table('hr_employee_benefits')
                            ->join('hr_employee_benefits_list', 'hr_employee_benefits_list.benefitlist_id', '=', 'hr_employee_benefits.benefitlist_id')
                            ->where('hr_employee_benefits_list.is_deleted', 0)
                            ->where('hr_employee_benefits_list.team', $user->team)
                            ->where('hr_employee_benefits_list.title', '!=', 'INSURANCE')
                            ->where('hr_employee_benefits_list.type', 3)
                            ->where('hr_employee_benefits.emp_id', $user->user_id)
                            ->where('hr_employee_benefits.isupdate', 0)
                            ->sum('hr_employee_benefits.amount');

                        if ($request->has('brackets')) {
                            // Insert 'brackets' data into the 'brackets' table
                            $brackets = $request->input('brackets');
                            if ($request->input('type') === 4) {
                                foreach ($brackets as $bracket) {
                                    switch ($request->input('chooseType')) {
                                        case 'Daily':
                                            $rate = $user->daily_rate - (($benefitSum ? $benefitSum : 0) / $user->work_days);
                                            break;
                                        case 'Weekly':
                                            $rate = ($user->daily_rate * ($user->work_days / 4)) - (($benefitSum ? $benefitSum : 0) / 4);
                                            break;
                                        case 'Semi-Monthly':
                                            $rate = ($user->monthly_rate - ($benefitSum ? $benefitSum : 0)) / 2;
                                            break;
                                        case 'Monthly':
                                            $rate = $user->monthly_rate - ($benefitSum ? $benefitSum : 0);
                                            break;
                                    }
                                    if ($rate >= $bracket['rangeFrom'] && $rate <= $bracket['rangeTo']) {
                                        $percent = $bracket['share'] / 100;
                                        $diff = $rate - $bracket['rangeFrom'];
                                        $diffPercent = $diff * $percent;
                                        $tax = $bracket['shareAmount'] + $diffPercent;

                                        DB::table('hr_employee_benefits')->insert([
                                            'description' => $request->input('title'),
                                            'amount' => $tax,
                                            'type' => $request->input('type'),
                                            'created_At' => $today,
                                            'benefitlist_id' => $benefitID,
                                            'emp_id' => $user->user_id,
                                            'team' => $user->team,
                                            'taxable' => $diff,
                                            'exempt' => $bracket['rangeFrom']
                                        ]);
                                    }
                                }
                            } else {
                                foreach ($brackets as $bracket) {
                                    if ($user->monthly_rate >= $bracket['rangeFrom'] && $user->monthly_rate <= $bracket['rangeTo']) {
                                        $percent = $bracket['share'] / 100;
                                        $percentRate = $percent * $user->monthly_rate;

                                        DB::table('hr_employee_benefits')->insert([
                                            'description' => $request->input('title'),
                                            'amount' => $percentRate,
                                            'type' => $request->input('type'),
                                            'created_At' => $today,
                                            'benefitlist_id' => $benefitID,
                                            'emp_id' => $user->user_id,
                                            'team' => $user->team
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }

                return response()->json([
                    'status' => 200,
                    'message' => "Success"
                ]);
            } else {
                $employee = DB::table('user')->select('*')->where('user_id', $request->input('emp_id'))->first();

                DB::table('hr_employee_benefits')->insert([
                    'description' => $request->input('title'),
                    'amount' => $request->input('amount'),
                    'type' => 2,
                    'created_At' => $today,
                    'benefitlist_id' => $request->input('benefitlist_id'),
                    'emp_id' => $employee->user_id,
                    'team' => $employee->team,
                    'chooseCutoff' => $request->input('chooseCutoff'),
                    'amountTotal' => $request->input('amountTotal')
                ]);

                return response()->json([
                    'status' => 200,
                    'message' => 'Success'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function getAdditionalBenefits($type, $id)
    {

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        try {
            if ($user->user_type === 'Super Admin') {
                $admin = DB::table('user')
                    ->select('*')
                    ->where('user_id', $id)
                    ->first();
                $listData = DB::table('hr_employee_benefits_list')
                    ->select(DB::raw("*"))
                    ->where('type', '=', $type)
                    ->where('is_deleted', '=', 0)
                    ->where('team', $admin->team)
                    ->get();
            } else {
                $listData = DB::table('hr_employee_benefits_list')
                    ->select(DB::raw("*"))
                    ->where('type', '=', $type)
                    ->where('is_deleted', '=', 0)
                    ->where('team', $user->team)
                    ->get();
            }

            return response()->json([
                'status' => 200,
                'data' => $listData
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 200,
                'data' => $e
            ]);
        }
    }
    
    public function getAdditionalBenefitsBrackets()
    {
        try {
            $listData = DB::table('hr_employee_benefit_brackets')
                ->select(DB::raw("*"))
                ->get();

            return response()->json([
                'status' => 200,
                'data' => $listData
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 200,
                'data' => $e
            ]);
        }
    }

    public function deleteAdditionalbenefits(Request $request)
    {
        $today = date('Y-m-d H:i:s');

        $delList = $request->validate([
            'benefitlist_id' => 'required',
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        try {
            DB::table("hr_employee_benefits_list")->where('benefitlist_id', '=', $delList)
                ->update(['is_deleted' => 1, 'deleted_by' => $userID, 'deleted_at' => $today]);
            DB::table("hr_employee_benefits")->where('benefitlist_id', '=', $delList)->delete();
            DB::table("hr_employee_benefit_brackets")->where('benefit_id', '=', $delList)->delete();
            $message = 'Success';
            return response()->json([
                'status' => 200,
                'message' => $message
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 200,
                'message' => $e
            ]);
        }
    }

    public function deleteEmployeeLoan(Request $request)
    {
        $today = date('Y-m-d H:i:s');

        $delList = $request->validate([
            'benefits_id' => 'required',
        ]);

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        try {
            DB::table("hr_employee_benefits")->where('benefits_id', '=', $delList)
                ->update(['is_deleted' => 1, 'deleted_by' => $userID, 'deleted_at' => $today]);
            $message = 'Success';
            return response()->json([
                'status' => 200,
                'message' => $message
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 200,
                'message' => $e
            ]);
        }
    }

    // --------------- END BENEFITS LIST ---------------
    public function createEmployee(Request $request)
    {
        $today = date('Y-m-d H:i:s');
        $validated = $request->validate([
            'fname' => 'required',
            'mname' => 'nullable',
            'lname' => 'required',
            'bdate' => 'required',
            'address' => 'required',
            'contact_number' => 'required',
            'email' => 'required',
            'username' => 'required',
            'password' => 'required',
            'confirm' => 'required',
            'team' => 'nullable',
            'user_type' => 'nullable',
        ]);
        $user = DB::table('user')
            ->select('*')
            ->get();
        $exist = 0;
        foreach ($user as $email) {
            if ($request->input('email') === $email->email) {
                $exist = 1;
            }
        }

        if ($validated) {
            if ($request->input('user_type') === 'Super Admin') {
                $userType = 'Admin';
            } else {
                $userType = 'Member';
            }
            $dataToCreate = [
                'fname' => $request->input('fname'),
                'mname' => $request->input('mname'),
                'lname' => $request->input('lname'),
                'bdate' => $request->input('bdate'),
                'address' => $request->input('address'),
                'contact_number' => $request->input('contact_number'),
                'email' => $request->input('email'),
                'username' => $request->input('username'),
                'password' => Hash::make($request->input('confirm')),
                'user_type' => $userType,
                'team' => $request->input('team'),
                'date_created' => $today,
            ];

            try {
                if ($exist !== 1) {
                    $insertUser = DB::table('user')->insertGetId($dataToCreate);

                    $message = "Success";
                }
            } catch (\Exception $e) {

                $message = $e;
            }
        }


        return response()->json([
            'status' => 200,
            'data' => $validated,
            'user_id' => isset($insertUser) ? $insertUser : null,
            'msg' => isset($message) ? $message : null
        ]);
    }

    public function createEmployeeLink(Request $request)
    {
        $today = date('Y-m-d H:i:s');
        $validated = $request->validate([
            'fname' => 'required',
            'mname' => 'nullable',
            'lname' => 'required',
            'bdate' => 'required',
            'address' => 'required',
            'contact_number' => 'required',
            'email' => 'required',
            'username' => 'required',
            'password' => 'required',
            'confirm' => 'required',
            'team' => 'nullable',
            'user_type' => 'nullable',
        ]);

        $user = DB::table('user')
            ->select('*')
            ->get();
        $exist = 0;
        foreach ($user as $email) {
            if ($request->input('email') === $email->email) {
                $exist = 1;
            }
        }

        if ($validated) {
            if ($request->input('user_type') === 'Super Admin') {
                $userType = 'Admin';
            } else {
                $userType = 'Member';
            }
            $dataToCreate = [
                'fname' => $request->input('fname'),
                'mname' => $request->input('mname'),
                'lname' => $request->input('lname'),
                'bdate' => $request->input('bdate'),
                'address' => $request->input('address'),
                'contact_number' => $request->input('contact_number'),
                'email' => $request->input('email'),
                'username' => $request->input('username'),
                'password' => Hash::make($request->input('confirm')),
                'user_type' => $userType,
                'team' => $request->input('team'),
                'date_created' => $today,
            ];

            try {
                if ($exist !== 1) {
                    $insertUser = DB::table('user')->insertGetId($dataToCreate);

                    $message = "Success";
                }
            } catch (\Exception $e) {

                $message = $e;
            }
        }


        return response()->json([
            'status' => 200,
            'data' => $validated,
            'user_id' => isset($insertUser) ? $insertUser : null,
            'msg' => isset($message) ? $message : null
        ]);
    }

    public function getSalaryIncrease($id, $dates)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $recordsDate = explode(",", $dates);
        $monthRecord = $recordsDate[0];
        $yearRecord = $recordsDate[1];

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $employee = DB::table('hr_salary_increase')
                ->join('user', 'hr_salary_increase.user_id', '=', 'user.user_id')
                ->whereRaw('MONTH(hr_salary_increase.created_at) = ?', [$monthRecord])
                ->whereRaw('YEAR(hr_salary_increase.created_at) = ?', [$yearRecord])
                ->where('hr_salary_increase.team', $admin->team)
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get(['hr_salary_increase.*', 'user.*']);
        } else {
            $employee = DB::table('hr_salary_increase')
                ->join('user', 'hr_salary_increase.user_id', '=', 'user.user_id')
                ->whereRaw('MONTH(hr_salary_increase.created_at) = ?', [$monthRecord])
                ->whereRaw('YEAR(hr_salary_increase.created_at) = ?', [$yearRecord])
                ->where('hr_salary_increase.team', $user->team)
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get(['hr_salary_increase.*', 'user.*']);
        }

        return response()->json([
            'status' => 200,
            'employee' => $employee,
        ]);
    }

    public function getEmployeeBenefit($id)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $employee_data[] = '';

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $employee = DB::table('hr_employee_benefits')
                ->join('user', 'hr_employee_benefits.emp_id', '=', 'user.user_id')
                ->where('hr_employee_benefits.team', $admin->team)
                ->where('hr_employee_benefits.amount', '!=', 0)
                ->orderBy('created_At', 'ASC')
                ->get(['hr_employee_benefits.*', 'user.*']);
        } else {
            $employee = DB::table('hr_employee_benefits')
                ->join('user', 'hr_employee_benefits.emp_id', '=', 'user.user_id')
                ->where('hr_employee_benefits.team', $user->team)
                ->where('hr_employee_benefits.amount', '!=', 0)
                ->orderBy('created_At', 'ASC')
                ->get(['hr_employee_benefits.*', 'user.*']);
        }

        return response()->json([
            'status' => 200,
            'employee' => $employee,
        ]);
    }

    public function getEmployeeBenefitHistory($id)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $employee_data[] = '';

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $employee = DB::table('hr_employee_benefits')
                ->join('user', 'hr_employee_benefits.emp_id', '=', 'user.user_id')
                ->where('hr_employee_benefits.team', $admin->team)
                ->where('hr_employee_benefits.amount', '!=', 0)
                ->orderBy('created_At', 'ASC')
                ->get(['hr_employee_benefits.*', 'user.*']);

            foreach ($employee as $emp) {
                if ($emp->type === 1) {
                    $employee_data[] = [
                        'sss1' => $emp->amount,
                    ];
                }
                if ($emp->type === 3) {
                    $employee_data[] = [
                        'sss3' => $emp->amount,
                    ];
                }
                if ($emp->type === 2) {
                    $employee_data[] = [
                        'loan' => $emp->amount,
                    ];
                }
                if ($emp->type === 4) {
                    $employee_data[] = [
                        'tax' => $emp->amount,
                    ];
                }
                $employee_data[] = [
                    'name' => $emp->fname + ' ' + $emp->lname,
                    'date' => $emp->created_At,
                ];
            }
        } else {
            $employee = DB::table('hr_employee_benefits')
                ->join('user', 'hr_employee_benefits.emp_id', '=', 'user.user_id')
                ->where('hr_employee_benefits.team', $user->team)
                ->where('hr_employee_benefits.amount', '!=', 0)
                ->orderBy('created_At', 'ASC')
                ->get(['hr_employee_benefits.*', 'user.*']);

            foreach ($employee as $emp) {
                if ($emp->type === 1) {
                    $employee_data[] = [
                        'sss1' => $emp->amount,
                    ];
                }
                if ($emp->type === 3) {
                    $employee_data[] = [
                        'sss3' => $emp->amount,
                    ];
                }
                if ($emp->type === 2) {
                    $employee_data[] = [
                        'loan' => $emp->amount,
                    ];
                }
                if ($emp->type === 4) {
                    $employee_data[] = [
                        'tax' => $emp->amount,
                    ];
                }
                $employee_data[] = [
                    'name' => $emp->fname + ' ' + $emp->lname,
                    'date' => $emp->created_At,
                ];
            }
        }

        return response()->json([
            'status' => 200,
            'employee' => $employee,
        ]);
    }

    public function getEmployeePayroll($id)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $employee = DB::table('hr_payroll_allrecords')
                ->join('user', 'hr_payroll_allrecords.emp_id', '=', 'user.user_id')
                ->where('user.team', $admin->team)
                ->where('hr_payroll_allrecords.is_deleted', 0)
                ->orderBy('created_at', 'ASC')
                ->get(['hr_payroll_allrecords.*', 'user.*']);
        } else {
            $employee = DB::table('hr_payroll_allrecords')
                ->join('user', 'hr_payroll_allrecords.emp_id', '=', 'user.user_id')
                ->where('user.team', $user->team)
                ->where('hr_payroll_allrecords.is_deleted', 0)
                ->orderBy('created_at', 'ASC')
                ->get(['hr_payroll_allrecords.*', 'user.*']);
        }

        return response()->json([
            'status' => 200,
            'employee' => $employee,
        ]);
    }

    public function getEmployeePayrollReports($id, $dates)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $recordsDate = explode(",", $dates);
        $monthRecord = $recordsDate[0];
        $yearRecord = $recordsDate[1];

        if ($user->user_type === 'Super Admin') {
            $admin = DB::table('user')
                ->select('*')
                ->where('user_id', $id)
                ->first();
            $employee = DB::table('hr_payroll_allrecords')
                ->join('user', 'hr_payroll_allrecords.emp_id', '=', 'user.user_id')
                ->where('user.team', $admin->team)
                ->where('hr_payroll_allrecords.is_deleted', 0)
                ->whereRaw('MONTH(hr_payroll_allrecords.payroll_fromdate) = ?', [$monthRecord])
                ->whereRaw('YEAR(hr_payroll_allrecords.payroll_fromdate) = ?', [$yearRecord])
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get(['hr_payroll_allrecords.*', 'user.*']);
        } else {
            $employee = DB::table('hr_payroll_allrecords')
                ->join('user', 'hr_payroll_allrecords.emp_id', '=', 'user.user_id')
                ->where('user.team', $user->team)
                ->where('hr_payroll_allrecords.is_deleted', 0)
                ->whereRaw('MONTH(hr_payroll_allrecords.payroll_fromdate) = ?', [$monthRecord])
                ->whereRaw('YEAR(hr_payroll_allrecords.payroll_fromdate) = ?', [$yearRecord])
                ->orderBy('user.lname', 'asc')
                ->orderBy('user.fname', 'asc')
                ->orderBy('user.mname', 'asc')
                ->get(['hr_payroll_allrecords.*', 'user.*']);
        }

        return response()->json([
            'status' => 200,
            'employee' => $employee,
        ]);
    }




    // ----------------------------------------------------------------
    // -----------------------  NEW  FUNCTIONS  -----------------------
    // ----------------------------------------------------------------

    public function getEmployees()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }
        
        $user = User::findOrFail($userID);
        $employees = User::where('team', $user->team)->where('is_deleted', 0)->get();

        return response()->json([ 'status' => 200, 'employees' => $employees ]);
    }
}
