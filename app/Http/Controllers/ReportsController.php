<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

use App\Models\User;
use App\Models\ReportsModel;
use App\Models\ReportTypesModel;
use App\Models\ReportViewersModel;
use App\Models\ReportEmployeesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ReportsController extends Controller
{
    public function getReport(Request $request)
    {
        log::info("ReportsController::getReport");

        $report = ReportsModel::find($request->reportID);
        $reportType = $report->reportType;

        $reportEmployees = ReportEmployeesModel::with(['user' => function($query) {
            $query->select('user_id', 'fname', 'mname', 'lname');
        }])->where('report_id', $report->id)->get();

        $selectedEmployees = $reportEmployees->map(function ($employee) {
            return $employee->user;
        });

        $reportViewers = ReportViewersModel::with(['user' => function($query) {
            $query->select('user_id', 'fname', 'mname', 'lname');
        }])->where('report_id', $report->id)->get();

        $viewers = $reportViewers->map(function ($employee) {
            return $employee->user;
        });

        return response()->json([
            'status' => 200,
            'report' => $report,
            'reportType' => $reportType,
            'reportEmployees' => $reportEmployees,
            'selectedEmployees' => $selectedEmployees,
            'viewers' => $viewers,
        ]);
    }

    public function getReports(Request $request)
    {
        log::info("ReportsController::getReports");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = User::where('user_id', $userID)->first();

        $reports = ReportsModel::with('reportType')
            ->where('is_deleted', 0)
            ->where('team', $user->team)
            ->whereHas('assignedEmployees', function($query) use ($user) {
                $query->where('employee_id', $user->user_id);
            })
            ->orWhere('created_by', $user->user_id)
            ->get();

        // $categories = EvaluationCategory::with('indicators')->where('evaluation_id', $evaluation->id)->get();

        return response()->json([
            'status' => 200,
            'reports' => $reports
        ]);
    }

    public function saveReport(Request $request)
    {
        log::info("ReportsController::saveReport");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        try {
            DB::beginTransaction();

            $user = User::where('user_id', $userID)->first();
            $date = Carbon::parse($request->date)->format('Y-m-d');
            $periodFrom = Carbon::parse($request->periodFrom)->format('Y-m-d');
            $periodTo = Carbon::parse($request->periodTo)->format('Y-m-d');
    
            $report = ReportsModel::create([
                "team" => $user->team,
                "title" => $request->title,
                "date" => $date,
                "report_type_id" => $request->type,
                "period_from" => $periodFrom,
                "period_to" => $periodTo,
                "description" => $request->description,
                "attachment" => "Attachment",
                'created_by' => $user->user_id,
            ]);

            $dateTime = now()->format('YmdHis');
            $fileName = 'report_' . $report->id . '_' . $dateTime . '.' . $request->attachment->getClientOriginalExtension();
            $filePath = $request->file('attachment')->storeAs('reports', $fileName, 'public');

            $report->attachment = $filePath;
            $report->save();

            $employeeIDs = $request->selectedEmployee;

            foreach ($employeeIDs as $employeeID){
                $employee = ReportEmployeesModel::create([
                    "report_id" => $report->id,
                    "employee_id" => $employeeID,
                ]);
            }

            DB::commit();
        
            return response()->json([ 
                'status' => 200,
                'report' => $report,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving report: " . $e->getMessage());

            throw $e;
        }
    }

    public function editReport(Request $request)
    {
        log::info("ReportsController::editReport");
        
        $report = ReportsModel::find($request->id);

        try {
            DB::beginTransaction();

            log::info($request);

            $date = Carbon::parse($request->date)->format('Y-m-d');
            $periodFrom = Carbon::parse($request->periodFrom)->format('Y-m-d');
            $periodTo = Carbon::parse($request->periodTo)->format('Y-m-d');

            $report->title = $request->title;
            $report->date = $date;
            $report->report_type_id = $request->type;
            $report->period_from = $periodFrom;
            $report->period_to = $periodTo;
            $report->description = $request->description;
            $report->is_edited = 1;

            if ( $request->attachmentChanged == 'true' ) {
                $dateTime = now()->format('YmdHis');
                $fileName = 'report_' . $report->id . '_' . $dateTime . '.' . $request->attachment->getClientOriginalExtension();
                $filePath = $request->file('attachment')->storeAs('reports', $fileName, 'public');
                $report->attachment = $filePath;
            }

            $report->save();

            $currentEmployees = ReportEmployeesModel::where("report_id", $report->id)->pluck('employee_id')->toArray();
            $newEmployees = $request->selectedEmployee;

            // Add new employees
            foreach ($newEmployees as $employeeID) {
                if (!in_array($employeeID, $currentEmployees)) {
                    ReportEmployeesModel::create([ "report_id" => $report->id, "employee_id" => $employeeID ]);
                }
            }

            // Remove employees that are not in the new selection
            foreach ($currentEmployees as $employeeID) {
                if (!in_array($employeeID, $newEmployees)) {
                    ReportEmployeesModel::where('report_id', $report->id)->where('employee_id', $employeeID)->delete();
                }
            }

            DB::commit();
        
            return response()->json([ 
                'status' => 200,
                'report' => $report->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving report: " . $e->getMessage());

            throw $e;
        }
    }

    public function getReportTypes(Request $request)
    {
        log::info("ReportsController::getReportTypes");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = User::where('user_id', $userID)->first();

        $reportTypes = ReportTypesModel::where('is_deleted', 0)->where('team', $user->team)->get();

        return response()->json([
            'status' => 200,
            'reportTypes' => $reportTypes
        ]);
    }

    public function saveReportType(Request $request)
    {
        log::info("ReportsController::saveReportType");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        try {
            DB::beginTransaction();

            $user = User::where('user_id', $userID)->first();
            
            $existingReportType = ReportTypesModel::where('team', $user->team)->where('type_name', $request->typeName)->first();

            if ( !$existingReportType) {

                $newReportType = ReportTypesModel::create([
                    "team"   => $user->team,
                    "type_name"   => $request->typeName,
                    'created_by' => $user->user_id,
                ]);

                DB::commit();

                $reportTypes = ReportTypesModel::where('is_deleted', 0)->where('team', $user->team)->get();
    
                return response()->json([ 'status' => 200, 'reportTypeID' => $newReportType->id, 'reportTypes' => $reportTypes ]);
            } else {
                return response()->json([ 'status' => 409, 'reportTypeID' => $existingReportType->id ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving report type: " . $e->getMessage());

            throw $e;
        }
    }

    public function saveReportViewer(Request $request)
    {
        log::info("ReportsController::saveReportViewer");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        try {
            DB::beginTransaction();

            $user = User::where('user_id', $userID)->first();
            $report = ReportsModel::find($request->reportID);
            $reportViewer = ReportViewersModel::where('report_id', $report->id)->where('viewer_id', $user->user_id)->first();

            if ( $reportViewer ) {
                return response()->json([ 'status' => 401 ]);
            } else {
                $reportViewer = ReportViewersModel::create([ "report_id" => $report->id, "viewer_id" => $user->user_id ]);
                
                DB::commit();

                return response()->json([ 'status' => 200 ]);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving report: " . $e->getMessage());

            throw $e;
        }
    }
}
