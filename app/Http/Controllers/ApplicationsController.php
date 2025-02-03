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
        Log::info($request);

        $user = Auth::user();

        try {
            DB::beginTransaction();

            Log::info('Saving Application');

            $path = '';
            if ($request ->hasFile('attachment')) {
                Log::info('File Detected!');
                $file = $request->file('attachment');
                $dateTime = now()->format('YmdHis');
                $fileName = 'image_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                Log::info($fileName);
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
        
        return response()->json(['status' => 200, 'applications' => $applications]);
        
    }

    public function getApplicationDetails(Request $request)
    {
        //Log::info("ApplicationsController::getApplicationTypes");
        $applicationId = $request->input('app_id');
        
        $application = ApplicationsModel::where('id',$applicationId)
                                 ->first();
        
        return response()->json(['status' => 200, 'application' => $application]);
        
    }
}
