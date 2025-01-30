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
        Log::info("ApplicationsController::getApplicationTypes");

        $user = Auth::user();
        $clientId = $user->client_id;

        log::info("clientId: " . $clientId);

        $types = ApplicationTypesModel::where('client_id', $clientId)
            ->select('id', 'name')
            ->where('deleted_at', NULL)
            ->where('deleted_by', NULL)
            ->get();

        return response()->json(['status' => 200, 'types' => $types]);
    }

    public function saveApplication(Request $request)
    {

        Log::info("ApplicationsController::saveApplication");

        Log::info($request);

        //$validated = $request->validate([ 'type_id' => 'required' ]);

        $user = Auth::user();

        //YYYY-MM-DD HH:MM:SS
        /*
        type_id
        from_date
        to_date
        attachment
        description
        */
        Log::info($request->input('from_date'));
        /*
        if (!$validated) {
            try {
                DB::beginTransaction();

                ApplicationsModel::create([
                    "type_id" => $request->input('type_id'),
                    "duration_start" => " ",
                    "duration_end" => " ",
                    "attachment" => $request->input('attachment'),
                    "description" => $request->input('description'),
                    "status" => "Pending",
                ]);
                
                DB::commit();
                
                return response()->json([ 'status' => 200 ]);

            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
            */
    }
}
