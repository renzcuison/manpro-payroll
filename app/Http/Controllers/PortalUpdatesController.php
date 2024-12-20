<?php

namespace App\Http\Controllers;

use App\Models\ClientSeenNotif;
use App\Models\PortalUpdate;
use App\Models\PortalUpdateComment;
use App\Models\PortalUpdateLike;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PortalUpdatesController extends Controller
{

	public function index(Request $request)
	{
		$portal_updates = PortalUpdate::selectRaw('tbl_portal_updates.portal_update_id, tbl_portal_updates.title, tbl_portal_updates.description, tbl_portal_updates.file, tbl_portal_updates.media_type, tbl_portal_updates.type, tbl_portal_updates.order_no, tbl_portal_updates.is_deleted, tbl_portal_updates.`status`, tbl_portal_updates.date_created, tbl_portal_updates.date_updated, tbl_portal_updates_type.title AS type_name')
			->join('tbl_portal_updates_type', 'tbl_portal_updates_type.portal_update_type_id', '=', 'tbl_portal_updates.type')
			->where('tbl_portal_updates.is_deleted', 0)
			->where('tbl_portal_updates.status', 1)
			->where('tbl_portal_updates.type', '!=', 6)
			->orderByDesc('tbl_portal_updates.date_created')->get();

		foreach ($portal_updates as $idx => $data)
		{
			$portal_updates[$idx]->likes = [];
			$portal_updates[$idx]->comments = [];

			$likes = PortalUpdateLike::where('portal_update_id', $data->portal_update_id)->get();
			if (count($likes) > 0)
			{
				$portal_updates[$idx]->likes = $likes;
			}

			$comments = PortalUpdateComment::where('portal_update_id', $data->portal_update_id)->get();
			if (count($comments) > 0)
			{
				$portal_updates[$idx]->comments = $comments;
			}
		}

		return response($portal_updates, 200);
	}

	public function likeUnlikeFeed(Request $request)
	{
		$fields = $request->validate([
			'portal_update_id' => 'required'
		]);

		$user = $request->user();

		$contact_fullname = implode(' ', [$user->contact_fname, $user->contact_mname, $user->contact_lname]);

		$like = PortalUpdateLike::firstOrCreate(['portal_update_id' => $fields['portal_update_id'], 'sender_contact_id' => $user->contact_id, 'sender_fullname' => $contact_fullname, 'sender_profile' => $user->contact_profile]);

		if (!$like->wasRecentlyCreated)
		{
			$like->delete();
		}

		return response(['success' => 1, 'like' => $like], 200);
	}

	public function commentFeed(Request $request)
	{
		$fields = $request->validate([
			'portal_update_id' => 'required',
			'message' => 'required|string',
		]);

		$user = $request->user();

		$contact_fullname = implode(' ', [$user->contact_fname, $user->contact_mname, $user->contact_lname]);

		$comment = PortalUpdateComment::create([
			'portal_update_id' => $fields['portal_update_id'],
			'sender_contact_id' => $user->contact_id,
			'sender_fullname' => $contact_fullname,
			'sender_profile_url' => $user->contact_profile,
			'message' => $fields['message']
		]);

		return response([
			'comment' => $comment
		], 201);
	}


	public function portalUpdatesNotifications(Request $request)
	{
		$contact_id = $request->user()->contact_id;
		// PortalUpdate::enableQueryLog();
		$notifications = PortalUpdate::selectRaw('tbl_portal_updates.portal_update_id, tbl_portal_updates_type.title AS type_name, tbl_portal_updates_type.color, tbl_portal_updates.title, tbl_portal_updates.description, tbl_portal_updates.type, tbl_portal_updates.date_created, tbl_portal_updates.file, tbl_portal_updates.status, tbl_portal_updates.is_deleted, tbl_client_seen_notif.id AS seen_notif_id')
		->join('tbl_portal_updates_type', 'tbl_portal_updates_type.portal_update_type_id', '=', 'tbl_portal_updates.type')
		->leftJoin('tbl_client_seen_notif', function ($join) use ($contact_id) {
			$join->on('tbl_client_seen_notif.portal_update_id', '=', 'tbl_portal_updates.portal_update_id');
			$join->on('tbl_client_seen_notif.contact_id', '=', PortalUpdate::raw($contact_id));
		})
		->where([
			['tbl_portal_updates.status', '=', 1],
			['tbl_portal_updates.is_deleted', '=', 0],
			['tbl_portal_updates.type', '!=', 6]
		])
		->orderBy('tbl_portal_updates.date_created', 'DESC')
		->get();

		return response([
			"notifications" => $notifications
		]);
	}

	public function portalUpdatesMarkNotifications(Request $request) {
		$fields = $request->validate([
			"portalIds" => "required|array"
		]);

		$contact_id = $request->user()->contact_id;
		$seenNotif = [];
		
		foreach ($fields["portalIds"] as  $portal_id) {
			$seenNotif[] = ClientSeenNotif::firstOrCreate([
				"contact_id" => $contact_id,
				"portal_update_id" => $portal_id
			]);
		}

		// dd($fields);
		return response([
			"success" => 1,
			"seenNotif" => $seenNotif
		]);

	}


	public function getFAQS() {
		$FAQS = PortalUpdate::selectRaw("portal_update_id, title, description, file, type, order_no, is_deleted, status, date_created, date_updated")
		->where([
			["type", 6],
			["is_deleted", 0],
			["status", 1]
		])
		->orderBy("order_no", "DESC")
		->get();

		return response($FAQS);
	}


	public function getPortalUpdateNavigation($type) {
		$portal_updates = PortalUpdate::where([
			['type', $type],
			['is_deleted', 0],
			['status', 1]
		])->orderBy("order_no")->get();

		foreach ($portal_updates as $idx => $data)
		{
			$portal_updates[$idx]->likes = [];
			$portal_updates[$idx]->comments = [];

			$likes = PortalUpdateLike::where('portal_update_id', $data->portal_update_id)->get();
			if (count($likes) > 0)
			{
				$portal_updates[$idx]->likes = $likes;
			}

			$comments = PortalUpdateComment::where('portal_update_id', $data->portal_update_id)->get();
			if (count($comments) > 0)
			{
				$portal_updates[$idx]->comments = $comments;
			}
		}

		return response($portal_updates, 200);
	}


}
