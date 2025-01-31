<?php

namespace App\Http\Controllers;

use App\Models\ApplicationTypesModel;
use App\Models\ApplicationsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;


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

        //YYYY-MM-DD HH:MM:SS
        /*
        type_id
        from_date
        to_date
        attachment
        description
        */

        try {
            DB::beginTransaction();

            ApplicationsModel::create([
                "type_id" => $request->input('type_id'),
                "duration_start" => $request->input('from_date'),
                "duration_end" => $request->input('to_date'),
                "attachment" => $request->input('attachment') ?? "",
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

        log::info("clientId: " . $clientId);
        log::info("userId:   " . $user->id);
        
        $applications = ApplicationsModel::where('client_id', $clientId)
                                 ->where('user_id', $user->id)
                                 ->select('id','type_id','created_at','duration_start','duration_end','status')
                                 ->get();
        
        return response()->json(['status' => 200, 'applications' => $applications]);
        
    }
}
