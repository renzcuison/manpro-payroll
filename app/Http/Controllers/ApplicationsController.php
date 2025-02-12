<?php

namespace App\Http\Controllers;

use App\Models\ApplicationsModel;
use App\Models\ApplicationTypesModel;
use App\Models\ApplicationFilesModel;

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

        $types = ApplicationTypesModel::where('client_id', $clientId)
            ->select('id', 'name', 'require_files')
            ->where('deleted_at', NULL)
            ->get();

        return response()->json(['status' => 200, 'types' => $types]);
    }

    public function saveApplication(Request $request)
    {

        //Log::info("ApplicationsController::saveApplication");
        $user = Auth::user();
        Log::info($request);

        try {
            DB::beginTransaction();

            $application = ApplicationsModel::create([
                "type_id" => $request->input('type_id'),
                "duration_start" => $request->input('from_date'),
                "duration_end" => $request->input('to_date'),
                "description" => $request->input('description') ?? "",
                "status" => "Pending",
                "user_id" => $user->id,
                "client_id" => $user->client_id,
            ]);

            $dateTime = now()->format('YmdHis');

            // Adding Files - Documents
            if ($request->hasFile('attachment')) {
                foreach ($request->file('attachment') as $file){
                    $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('applications/employees/attachments', $fileName, 'public');
                    ApplicationFilesModel::create([
                        'application_id' => $application->id,
                        'type' => "Document",
                        'path' => $filePath,
                    ]);
                }
            }

            // Adding Files - Images
            if ($request->hasFile('image')) {
                foreach ($request->file('image') as $index => $file){
                    $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('applications/employees/images', $fileName, 'public');
                    ApplicationFilesModel::create([
                        'application_id' => $application->id,
                        'type' => "Image",
                        'path' => $filePath,
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([ 'status' => 200 ]);

        } catch (\Exception $e) {
            DB::rollBack();

            //Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }
            
    }

    public function editApplication(Request $request)
    {
        //Log::info("ApplicationsController::updateApplication");
        $user = Auth::user();

        try {
            DB::beginTransaction();

            //Application Update
            $application = ApplicationsModel::find($request->input('id'));

            $application->type_id = $request->input('type_id');
            $application->duration_start = $request->input('from_date');
            $application->duration_end = $request->input('to_date');
            $application->description = $request->input('description');
            $application->save();

            // Remove Files
            $deleteFiles = array_merge($request->input('deleteImages'),$request->input('deleteAttachments'));
            ApplicationFilesModel::whereIn('id', $deleteFiles)->delete();

            $dateTime = now()->format('YmdHis');

            // Adding Files - Documents
            if ($request->hasFile('attachment')) {
                foreach ($request->file('attachment') as $file){
                    $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('applications/employees/attachments', $fileName, 'public');
                    ApplicationFilesModel::create([
                        'application_id' => $application->id,
                        'type' => "Document",
                        'path' => $filePath,
                    ]);
                }
            }

            // Adding Files - Images
            if ($request->hasFile('image')) {
                foreach ($request->file('image') as $index => $file){
                    $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('applications/employees/images', $fileName, 'public');
                    ApplicationFilesModel::create([
                        'application_id' => $application->id,
                        'type' => "Image",
                        'path' => $filePath,
                    ]);
                }
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }

        /*
        $application = ApplicationsModel::find($request->input('app_id'));

        $application->type_id = $request->input('type_id');
        $application->duration_start = $request->input('from_date');
        $application->duration_end = $request->input('to_date');
        $application->description = $request->input('description');

        if ($request ->hasFile('attachment')) {
            $file = $request->file('attachment');
            $dateTime = now()->format('YmdHis');
            $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('applications/employees', $fileName, 'public');
            $application->attachment = $filePath;
        }

        $application->save();

        return response()->json(['status' => 200, 'message' => 'Application Updated!', 'application' => $application], 200);
        */
    }

    public function getMyApplications()
    {
        //Log::info("ApplicationsController::getApplicationTypes");

        $user = Auth::user();
        $clientId = $user->client_id;
        
        $applications = ApplicationsModel::where('client_id', $clientId)
                                 ->where('user_id', $user->id)
                                 ->get();

        $applications = $applications->map(function($application) {
            $application->attachment = basename($application->attachment);
            return $application;
        });
        
        return response()->json(['status' => 200, 'applications' => $applications]);
        
    }

    public function getDashboardApplications()
    {
        //Log::info("ApplicationsController::getDashboardApplications");

        $user = Auth::user();

        $clientId = $user->client_id;
        $apps = ApplicationsModel::where('client_id', $clientId)
            ->take(10)
            ->get();

        $applications = [];

        foreach ($apps as $app) {
            $employee = $app->user;
            $type = $app->type;

            $applications[] = [
                'app_id' => $app->id,
                'app_type' => $type->name,
                'app_status' => $app->status,
            ];
        }

        return response()->json(['status' => 200, 'applications' => $applications]);

    }

    public function downloadAttachment($id)
    {
        //Log::info("ApplicationsController::downloadAttachment");
        $application = ApplicationsModel::find($id);

        if (!$application || !$application->attachment) {
            return response()->json(['status' => 404, 'message' => 'Attachment not found'], 404);
        }

        $filePath = storage_path('app/public/' . $application->attachment);

        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $fileName = basename($application->attachment);

        return response()->download($filePath, $fileName);
    }


    public function withdrawApplication($id)
    {   
        //Log::info("ApplicationsController::withdrawApplication");

        $application = ApplicationsModel::find($id);

        if (!$application) {
            //Log::error('Application not found for ID: ' . $id);
            return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
        }

        if ($application->status !== 'Pending') {
            //Log::warning('Application ' . $id . ' cannot be withdrawn.');
            return response()->json(['status' => 400, 'message' => 'Only pending applications can be withdrawn'], 400);
        }

        $application->status = 'Withdrawn';
        $application->save();

        return response()->json(['status' => 200, 'message' => 'Application Withdrawal Successful!'], 200);
    }

    public function manageApplication($id, $action)
    {   
        //Log::info("ApplicationsController::manageApplication");
        
        $user = Auth::user();

        
        if ($this->checkUser()) {
            $application = ApplicationsModel::find($id);

            if (!$application) {
                //Log::error('Application not found for ID: ' . $id);
                return response()->json(['status' => 404, 'message' => 'Application not found'], 404);
            }

            switch($action) {
                case 'Approve':
                    $application->status = "Approved";
                    $message = "Application Approved";
                    break;
                case 'Decline':
                    $application->status = "Declined";
                    $message = "Application Declined";
                    break;
            }
            $application->save();
            
            return response()->json(['status' => 200, 'message' => $message], 200);
        } else {
            return response()->json(['status' => 200, 'message' => 'Insufficient Permissions!'], 200);
        }

    }

    public function getFileNames($id)
    {
        //Log::info("AnnouncementsController::getFileNames");
        $user = Auth::user();
        
        $files = ApplicationFilesModel::where('application_id', $id)
                ->select('id', 'path', 'type')
                ->get();

                $filenames = [];
                foreach($files as $file){
                    $filenames[] = [
                        'id' => $file->id,
                        'filename' => basename($file->path),
                        'type' => $file->type
                    ];
                }

            return response()->json([ 'status' => 200, 'filenames' => $filenames ? $filenames : null ]);
        
    }

    
}
