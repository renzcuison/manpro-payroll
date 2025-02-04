<?php

namespace App\Http\Controllers;

use App\Models\ApplicationTypesModel;
use App\Models\ApplicationsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ApplicationsController extends Controller
{
    public function checkUser()
    {
        // Log::info("ApplicationsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getApplications()
    {
        //Log::info("ApplicationsController::getApplications");

        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $apps = ApplicationsModel::where('client_id', $clientId)->where('status', 'Pending')->get();

            $applications = [];

            foreach ($apps as $app) {
                $employee = $app->user;
                $type = $app->type;

                $applications[] = [
                    'app_id' => $app->id,
                    'app_type' => $type->name,
                    'app_duration_start' => $app->duration_start,
                    'app_duration_end' => $app->duration_end,
                    'app_date_requested' => $app->created_at,
                    'app_attachment' => basename($app->attachment),
                    'app_description' => $app->description,
                    'app_status' => $app->status,
                    'emp_first_name' => $employee->first_name,
                    'emp_middle_name' => $employee->middle_name,
                    'emp_last_name' => $employee->last_name,
                    'emp_suffix' => $employee->suffix,
                ];
            }

            return response()->json(['status' => 200, 'applications' => $applications]);
        } else {
            return response()->json(['status' => 200, 'applications' => null]);
        }

        
    }

    public function getApplicationTypes()
    {
        //Log::info("ApplicationsController::getApplicationTypes");

        $user = Auth::user();
        $clientId = $user->client_id;

        //log::info("clientId: " . $clientId);

        $types = ApplicationTypesModel::where('client_id', $clientId)
            ->select('id', 'name')
            ->where('deleted_at', NULL)
            ->where('deleted_by', NULL)
            ->get();

        return response()->json(['status' => 200, 'types' => $types]);
    }

    public function saveApplication(Request $request)
    {

        //Log::info("ApplicationsController::saveApplication");
        //Log::info($request);

        $user = Auth::user();

        try {
            DB::beginTransaction();

            //Log::info('Saving Application');

            if ($request ->hasFile('attachment')) {
                //Log::info('File Detected!');
                $file = $request->file('attachment');
                $dateTime = now()->format('YmdHis');
                $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                //Log::info($fileName);
                $filePath = $file->storeAs('applications/employees', $fileName, 'public');
            }

            ApplicationsModel::create([
                "type_id" => $request->input('type_id'),
                "duration_start" => $request->input('from_date'),
                "duration_end" => $request->input('to_date'),
                "attachment" => $filePath,
                "description" => $request->input('description') ?? "",
                "status" => "Pending",
                "user_id" => $user->id,
                "client_id" => $user->client_id,
            ]);
            
            DB::commit();
            
            return response()->json([ 'status' => 200 ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }
            
    }

    public function updateApplication(Request $request)
    {
        //Log::info("ApplicationsController::updateApplication");
        //Log::info($request);
        //Log::info($request->input('app_id'));

        $user = Auth::user();

        $application = ApplicationsModel::find($request->input('app_id'));

        if (!$application) {
            Log::error('Application not found for ID: ' . $request->input('app_id'));
            return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
        }

        $application->type_id = $request->input('type_id');
        $application->duration_start = $request->input('from_date');
        $application->duration_end = $request->input('to_date');
        $application->description = $request->input('description');

        if ($request ->hasFile('attachment')) {
            //Log::info('File Detected!');
            $file = $request->file('attachment');
            $dateTime = now()->format('YmdHis');
            $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
            //Log::info($fileName);
            $filePath = $file->storeAs('applications/employees', $fileName, 'public');
            $application->attachment = $filePath;
        }

        $application->save();

        return response()->json(['status' => 200, 'message' => 'Application Updated!', 'application' => $application], 200);
    }

    public function getMyApplications()
    {
        //Log::info("ApplicationsController::getApplicationTypes");

        $user = Auth::user();
        $clientId = $user->client_id;

        //log::info("clientId: " . $clientId);
        //log::info("userId:   " . $user->id);
        
        $applications = ApplicationsModel::where('client_id', $clientId)
                                 ->where('user_id', $user->id)
                                 ->get();

        $applications = $applications->map(function($application) {
            $application->attachment = basename($application->attachment);
            return $application;
        });
        
        return response()->json(['status' => 200, 'applications' => $applications]);
        
    }

    public function downloadAttachment($id)
    {
        //Log::info("ApplicationsController::downloadAttachment");
        $application = ApplicationsModel::find($id);
        //Log::info('Application Found');

        if (!$application || !$application->attachment) {
            return response()->json(['status' => 404, 'message' => 'Attachment not found'], 404);
        }

        //Log::info($application->attachment);
        $filePath = storage_path('app/public/' . $application->attachment);
        //log::info($filePath);

        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $fileName = basename($application->attachment);

        return response()->download($filePath, $fileName);
    }


    public function withdrawApplication($id)
    {   
        //Log::info("ApplicationsController::withdrawApplication");
        //Log::info($id);

        $application = ApplicationsModel::find($id);

        if (!$application) {
            Log::error('Application not found for ID: ' . $id);
            return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
        }

        if ($application->status !== 'Pending') {
            Log::warning('Application ' . $id . ' cannot be withdrawn.');
            return response()->json(['status' => 400, 'message' => 'Only pending applications can be withdrawn'], 400);
        }

        $application->status = 'Withdrawn';
        $application->save();

        //Log::info('Application ' . $id . ' has been withdrawn');

        return response()->json(['status' => 200, 'message' => 'Application Withdrawal Successful!'], 200);
    }

    public function manageApplication($id, $action)
    {   
        Log::info("ApplicationsController::manageApplication");
        Log::info($id);
        Log::info($action);
        
        $user = Auth::user();

        /*
        if ($this->checkUser()) {
            return response()->json(['status' => 200, 'message' => $message], 200);
        } else {
            return response()->json(['status' => 200, 'message' => 'Insufficient Permissions!'], 200);
        }
        */

    }

    
}
