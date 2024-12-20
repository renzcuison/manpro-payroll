<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

use App\Models\User;
use App\Models\PreviousFilterModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PreviousFilterController extends Controller
{
    public function previousFilter(Request $request)
    {
        // log::info("PreviousFilterController::previousFilter");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = User::where('user_id', $userID)->first();
        $record = PreviousFilterModel::where("user_id", $user->user_id)->where("module", $request->module)->where("page", $request->page)->where('filter', $request->filter)->first();

        if ( $record ) {
            return response()->json([ 'status' => 200, 'record' => $record, 'hasRecord' => true ]);
        } else {
            return response()->json([ 'status' => 200, 'record' => $record, 'hasRecord' => false ]);
        }

        
    }

    public function addFilter(Request $request)
    {
        // log::info("PreviousFilterController::addFilter");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = User::where('user_id', $userID)->first();
        $record = PreviousFilterModel::where("user_id", $user->user_id)->where("module", $request->module)->where("page", $request->page)->where('filter', $request->filter)->first();

        $date = new \DateTime($request->date);
        $formattedDate = $date->format('Y-m-d');

        if ( $record ) {
            $record->date = $date;
            $record->save();

            return response()->json([ 'status' => 200, 'record' => $record, ]);
        } else {
            $record = PreviousFilterModel::create([
                "user_id"   => $user->user_id,
                "module"   => $request->module,
                "page" => $request->page,
                "filter" => $request->filter,
                "date" => $formattedDate,
            ]);

            return response()->json([ 'status' => 200, 'record' => $record, ]);
        }
    }
}
