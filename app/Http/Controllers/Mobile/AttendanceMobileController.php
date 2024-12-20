<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\HrAttendance;
use App\Models\HrWorkday;
use App\Models\HrWorkhour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AttendanceMobileController extends Controller
{
    public function index()
    {
        $attendance = HrAttendance::all();

        return response()->json(
            [
                'attendance' => $attendance,
            ],
            200,
        );
    }

    public function showAttendance()
    {
        try {
            $user = Auth::user();
            $attendance = HrAttendance::where('user_id', $user->user_id)->get();

            return response(['attendance' => $attendance, 200]);
        } catch (\Exception $e) {
            return response(
                [
                    'error' => 'An error occurred',
                    'message' => $e->getMessage(),
                ],
                500,
            );
        }
    }

    public function showCurrentAttendance(Request $request)
    {
        $parsedToday = Carbon::parse($request->current_date)->startOfDay();
        Log::info("Date today: ", ['today' => $parsedToday]);
        try {
            $user = Auth::user();
            $currentAttendance = HrAttendance::where('start_date', $parsedToday)
                ->where('user_id', $user->user_id)
                ->first();

            if ($currentAttendance) {
                return response(['currentAttendance' => $currentAttendance], 200);
            } else {
                return response(
                    [
                        'message' => 'Attendance record not found',
                    ],
                    404,
                );
            }
        } catch (\Exception $e) {
            return response()->json(
                [
                    'error' => 'An error occurred',
                    'message' => $e->getMessage(),
                ],
                500,
            );
        }
    }

    public function showAbsents(Request $request)
    {
        try {
            $validator = $request->validate([
                'start_date' => 'date|required',
            ]);

            $user = Auth::user();
            $absents = HrAttendance::where('start_date', $validator['start_date'])
                ->where('user_id', $user->user_id)
                ->get();

            return response()->json([
                'absents' => $absents,
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'error' => 'An error occurred',
                    'message' => $e->getMessage(),
                ],
                500,
            );
        }
    }

    public function fetchWorkhours()
    {
        $user = Auth::user();
        $workhours = HrWorkhour::where('team', $user->team)->first();

        return response()->json(
            [
                'workhours' => $workhours,
            ],
            200,
        );
    }

    public function recordAttendance(Request $request)
    {
        $validator = $request->validate([
            'morning_in' => 'date',
            'morning_out' => 'date',
            'afternoon_in' => 'date',
            'afternoon_out' => 'date',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'current_date' => 'required|date',
            'color' => 'required|string',
        ]);
        
        $user = Auth::user();
        $workday = HrWorkday::where('start_date', $validator['current_date'])
            ->where('team', $user->team)
            ->where('type', 1)
            ->where('is_deleted', 0)
            ->first();
        $workhour = HrWorkhour::where('hour_id', $workday->hour_id)
            ->where('team', $user->team)
            ->first();
        
        $attendance = HrAttendance::where('start_date', $validator['current_date'])
            ->where('user_id', $user->user_id)
            ->first();

        $now = Carbon::now('Asia/Manila')->format('H:i:s');
        $morning_in = Carbon::parse($workhour->hours_morning_in)->copy()->toTimeString();
        $morning_out = Carbon::parse($workhour->hours_morning_out)->copy()->toTimeString();
        $afternoon_in = Carbon::parse($workhour->hours_afternoon_in)->copy()->toTimeString();
        $afternoon_out = Carbon::parse($workhour->hours_afternoon_out)->copy()->toTimeString();

        $attendanceDefault = [
            'start_date' => $validator['start_date'],
            'end_date' => $validator['end_date'],
            'color' => $validator['color'],
            'user_id' => $user->user_id,
            'status' => "attendance",
            'workday_id' => $workday->workday_id,
            'type' => 2,
        ];

        if($attendance){
            if($now >= $afternoon_out && $attendance->afternoon_in == null && $attendance->morning_out == null){
                Log::info('Entered Here 3b', ['afternoon_out' => $validator['afternoon_out']]);
                $attendance->morning_out = $validator['morning_out'];
                $attendance->afternoon_in = $validator['afternoon_in'];
                $attendance->afternoon_out = $validator['afternoon_out'];
            }else if($now >= $afternoon_out && $attendance->afternoon_in == null){
                Log::info('Entered Here 3b', ['afternoon_out' => $validator['afternoon_out']]);
                $attendance->afternoon_in = $validator['afternoon_in'];
                $attendance->afternoon_out = $validator['afternoon_out'];
            }else if($now >= $afternoon_out && $attendance->afternoon_in != null){
                Log::info('Entered Here 3a', ['afternoon_out' => $validator['afternoon_out']]);
                $attendance->afternoon_out = $validator['afternoon_out'];
            }else if($now >= $afternoon_in && $attendance->morning_out == null){
                Log::info('Entered Here 2', ['afternoon_in' => $validator['afternoon_in']]);
                $attendance->morning_out = $validator['morning_out'];
                $attendance->afternoon_in = $validator['afternoon_in'];
            }else if($now >= $afternoon_in && $attendance->morning_out != null){
                Log::info('Entered Here 2', ['afternoon_in' => $validator['afternoon_in']]);
                $attendance->afternoon_in = $validator['afternoon_in'];
            }else if($now >= $morning_out){
                Log::info('Entered Here 1', ['morning_out' => $validator['morning_out']]);
                $attendance->morning_out = $validator['morning_out'];
            }
            $attendance->save();
        }else{
            if($now < $morning_out){
                Log::info('Entered Here 4');    
                $attendance = HrAttendance::create(array_merge($attendanceDefault,[
                    'morning_in' => $validator['morning_in'],
                ]));
            }else if($now < $afternoon_in){
                Log::info('Entered Here 5');
                $attendance = HrAttendance::create(array_merge($attendanceDefault,[
                    'morning_in' => $validator['morning_in'],
                    'morning_out' => $validator['morning_out'],
                ]));
            }else if($now < $afternoon_out){
                Log::info('Entered Here 6');
                $attendance = HrAttendance::create(array_merge($attendanceDefault,[
                    'morning_in' => $validator['morning_in'],
                    'morning_out' => $validator['morning_out'],
                    'afternoon_in' => $validator['afternoon_in'],
                ]));
            }else {
                Log::info('Entered Here 7');
                $attendance = HrAttendance::create(array_merge($attendanceDefault,[
                    'morning_in' => $validator['morning_in'],
                    'morning_out' => $validator['morning_out'],
                    'afternoon_in' => $validator['afternoon_in'],
                    'afternoon_out' => $validator['afternoon_out'],
                ]));
            }
        }
    }

    public function workdays()
    {
        try {
            $user = Auth::user();
            //Log::info('Auth Team Test: ', ['team' => $user->team,]);
            $now = Carbon::now('Asia/Manila')->format('Y-m-d');
            $workdays = HrWorkday::join(
                'hr_workhours',
                'hr_workdays.hour_id',
                '=',
                'hr_workhours.hour_id'
            )
                ->where('hr_workdays.team', $user->team)
                ->where('hr_workdays.is_deleted', 0)
                ->where('hr_workdays.type', 1)
                ->whereDate('hr_workdays.start_date', $now)
                ->orderBy('hr_workdays.workday_id', 'desc')
                ->first();

                Log::info('Workdays function accessed.', ['workdays' => $workdays]);
            return response()->json(
                [
                    'workdays' => $workdays,
                ],
                200
            );
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // public function morningIn(Request $request)
    // {
    //     Log::info('Morning in function is accessed.');
    //     try {
    //         $validator = $request->validate([
    //             'morning_in' => 'required|date',
    //             'start_date' => 'required|date',
    //             'current_date' => 'required|date',
    //             'color' => 'required|string',
    //         ]);
    //         Log::info('Validator content.', ['validator' => $validator]);
    //         $user = Auth::user();
    //         $workday = HrWorkday::where('start_date', $validator['current_date'])
    //             ->where('team', $user->team)
    //             ->where('type', 1)
    //             ->where('is_deleted', 0)
    //             ->first();
    //         Log::info('Filtered workday.', ['workday' => $workday]);
    //         $workhour = HrWorkhour::where('hour_id', $workday->hour_id)
    //             ->where('team', $user->team)
    //             ->first();
    //         Log::info('Filtered workhour.', ['workhour' => $workhour]);
    //         //add to validator
    //         $validator['user_id'] = $user->user_id;
    //         $validator['status'] = "attendance";
    //         $validator['workday_id'] = $workday->workday_id;
    //         $validator['type'] = 1;
            
    //         // if ($workhour->noon_break === 'Yes') {
    //         //     $validator['morning_out'] = $validator['current_date'] . ' ' . $workhour->hours_morning_out;
    //         //     $validator['afternoon_in'] = $validator['current_date'] . ' ' . $workhour->hours_afternoon_in;
    //         // }

    //         $attendance = HrAttendance::where('start_date', $validator['current_date'])
    //             ->where('user_id', $user->user_id)
    //             ->first();

    //         if ($attendance) {
    //             return response()->json(
    //                 [
    //                     'message' => 'You have already Checked-in this Morning',
    //                 ],
    //                 400,
    //             );
    //         } else {
    //             $attendance = HrAttendance::create($validator);

    //             if ($attendance) {
    //                 return response()->json(
    //                     [
    //                         'attendance' => $attendance,
    //                         'message' => 'Morning Checked-in successfully',
    //                     ],
    //                     201,
    //                 );
    //             }
    //         }
    //     } catch (\Exception $e) {
    //         return response()->json(
    //             [
    //                 'error' => 'An error occurred',
    //                 'message' => $e->getMessage(),
    //             ],
    //             500,
    //         );
    //     }
    // }

    // public function morningOut(Request $request)
    // {
    //     Log::info('Morning out function is accessed.');
    //     try {
    //         $validator = $request->validate([
    //             'morning_in' => 'required|date',
    //             'morning_out' => 'required|date',
    //             'start_date' => 'required|date',
    //             'end_date' => 'required|date',
    //             'current_date' => 'required|date',
    //             'color' => 'required|string',
    //         ]);
    //         Log::info('Validator content.', ['validator' => $validator]);
    //         $user = Auth::user();
    //         $workday = HrWorkday::where('start_date', $validator['current_date'])
    //             ->where('team', $user->team)
    //             ->where('type', 1)
    //             ->where('is_deleted', 0)
    //             ->first();
    //         Log::info('Filtered workday.', ['workday' => $workday]);
    //         $attendance = HrAttendance::where('start_date', $validator['current_date'])
    //             ->where('user_id', $user->user_id)
    //             ->where('workday_id', $workday->workday_id)
    //             ->first();
    //         Log::info('Filtered attendance.', ['attendance' => $attendance]);
    //         $validator['user_id'] = $user->user_id;
    //         $validator['status'] = "attendance";
    //         $validator['workday_id'] = $workday->workday_id;
    //         $validator['type'] = 2;

    //         if ($attendance) {
    //             if ($attendance->morning_out) {
    //                 return response()->json(
    //                     [
    //                         'message' => 'You have already Checked-Out this Morning',
    //                     ],
    //                     400,
    //                 );
    //             } else {
    //                 $attendance->morning_out = $validator['morning_out'];
    //                 $attendance->save();

    //                 return response()->json(
    //                     [
    //                         'attendance' => $attendance,
    //                         'message' => 'Morning Checked-out successfully',
    //                     ],
    //                     201,
    //                 );
    //             }
    //         } else {
    //             $attendance = HrAttendance::create($validator);

    //             return response()->json(
    //                 [
    //                     'attendance' => $attendance,
    //                     'message' => 'Morning Checked-out successfully',
    //                 ],
    //                 201,
    //             );
    //         }
    //     } catch (\Exception $e) {
    //         return response()->json(
    //             [
    //                 'error' => 'An error occurred',
    //                 'message' => $e->getMessage(),
    //             ],
    //             500,
    //         );
    //     }
    // }

    // public function afternoonIn(Request $request)
    // {
    //     try {
    //         $validator = $request->validate([
    //             'afternoon_in' => 'required|date',
    //             'start_date' => 'required|date',
    //             'current_date' => 'required|date',
    //             'color' => 'required|string',
    //         ]);

    //         $user = Auth::user();
    //         $workday = HrWorkday::where('start_date', $validator['current_date'])
    //             ->where('team', $user->team)
    //             ->where('type', 1)
    //             ->where('is_deleted', 0)
    //             ->first();

    //         $attendance = HrAttendance::where('start_date', $validator['current_date'])
    //             ->where('user_id', $user->user_id)
    //             ->where('workday_id', $workday->workday_id)
    //             ->first();

    //         $validator['user_id'] = $user->user_id;
    //         $validator['status'] = "attendance";
    //         $validator['workday_id'] = $workday->workday_id;
    //         $validator['type'] = 3;

    //         if ($attendance) {
    //             if ($attendance->afternoon_in) {
    //                 return response()->json(
    //                     [
    //                         'message' => 'You have already Checked-In this Afternoon',
    //                     ],
    //                     400,
    //                 );
    //             } else {
    //                 $attendance->afternoon_in = $validator['afternoon_in'];
    //                 $attendance->save();

    //                 return response()->json(
    //                     [
    //                         'attendance' => $attendance,
    //                         'message' => 'Afternoon Checked-in successfully',
    //                     ],
    //                     201,
    //                 );
    //             }
    //         } else {
    //             $attendance = HrAttendance::create($validator);

    //             return response()->json(
    //                 [
    //                     'attendance' => $attendance,
    //                     'message' => 'Afternoon Checked-in successfully',
    //                 ],
    //                 201,
    //             );
    //         }
    //     } catch (\Exception $e) {
    //         return response()->json(
    //             [
    //                 'error' => 'An error occurred',
    //                 'message' => $e->getMessage(),
    //             ],
    //             500,
    //         );
    //     }
    // }

    // public function afternoonOut(Request $request)
    // {
    //     try {
    //         $validator = $request->validate([
    //             'afternoon_in' => 'required|date',
    //             'afternoon_out' => 'required|date',
    //             'start_date' => 'required|date',
    //             'end_date' => 'required|date',
    //             'current_date' => 'required|date',
    //             'color' => 'required|string',
    //         ]);

    //         $user = Auth::user();

    //         $workday = HrWorkday::where('start_date', $validator['current_date'])
    //             ->where('team', $user->team)
    //             ->where('type', 1)
    //             ->where('is_deleted', 0)
    //             ->first();

    //         $attendance = HrAttendance::where('start_date', $validator['current_date'])
    //             ->where('user_id', $user->user_id)
    //             ->where('workday_id', $workday->workday_id)
    //             ->first();

    //         $validator['user_id'] = $user->user_id;
    //         $validator['status'] = "attendance";
    //         $validator['workday_id'] = $workday->workday_id;
    //         $validator['type'] = 4;

    //         if ($attendance) {
    //             if ($attendance->afternoon_in) {
    //                 if ($attendance->afternoon_out) {
    //                     return response()->json(
    //                         [
    //                             'message' => 'You have already Checked-Out this Afternoon',
    //                         ],
    //                         400,
    //                     );
    //                 } else {
    //                     $attendance->afternoon_out = $validator['afternoon_out'];
    //                     $attendance->end_date = $validator['end_date'];
    //                     $attendance->save();

    //                     return response()->json(
    //                         [
    //                             'attendance' => $attendance,
    //                             'message' => 'Afternoon Checked-out successfully',
    //                         ],
    //                         201,
    //                     );
    //                 }
    //             } else {
    //                 $attendance = HrAttendance::create($validator);

    //                 return response()->json(
    //                     [
    //                         'message' => 'You have already Checked-Out this Afternoon',
    //                     ],
    //                     400,
    //                 );
    //             }
    //         } else {
    //             $attendance = HrAttendance::create($validator);

    //             return response()->json(
    //                 [
    //                     'attendance' => $attendance,
    //                     'message' => 'Afternoon Checked-out successfully',
    //                 ],
    //                 201,
    //             );
    //         }
    //     } catch (\Exception $e) {
    //         return response()->json(
    //             [
    //                 'error' => 'An error occurred',
    //                 'message' => $e->getMessage(),
    //             ],
    //             500,
    //         );
    //     }
    // }
}
