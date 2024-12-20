<?php

namespace App\Http\Controllers;

use App\Models\ScheduledCall;
use Illuminate\Http\Request;

class CallSchedulingController extends Controller
{
    public function index(Request $request)
		{

			$contact_id = $request->user()->contact_id;

			$scheduledCalls = ScheduledCall::where('contact_id', $contact_id)
			->where('is_deleted', 0)
			->orderBy('date_created', 'desc')
			->get();

			if (!$scheduledCalls)
			{
				return response([
					'message' => "Error getting scheduled calls"
				]);
			}
			return response($scheduledCalls);
		}

		public function create(Request $request){

			try {
				
			$contact_id = $request->user()->contact_id;
			$firstname = $request->user()->contact_fname;
			$lastname = $request->user()->contact_lname;
			$fullname = ucwords(strtolower($firstname.' '.$lastname));
			$fbname = $request->user()->contact_fbname;
			$email = $request->user()->contact_email;
			$location = $request->user()->contact_location;

			$attributes = $request->validate([
				"start_date" => "required",
				"channel" => "required",
				"phone" => "required"
			]);

			$personal_info = array(
				"contact_id" => $contact_id,
				"fullname" => $fullname,
				"fbname" => $fbname,
				"location" => $location,
				"color" => "rgb(235, 245, 223)",
				"event_name" => "Name: ".$fullname." \r\Facebook:".$fbname." \r\Email:".$email." \r\Phone:".$attributes['phone']." \r\Channel:".$attributes['channel']." \r\Location:".$location
			);

			$merged_data = array_merge(
        (array) $attributes, (array) $personal_info);
			// $personal_info[0] = $attributes;

			$createScheduledCall = ScheduledCall::create($merged_data);

			// if (!$createScheduledCall){
			// 	return response([
			// 		"message" => "error creating"
			// 	]);
			// }

			return response([
				"message" => "success",
				"data" => $createScheduledCall
			]);
			} catch (\Throwable $th) {
				return response([
					"erorr: " => $th
				]);
			}
		}

}
