<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use App\Models\ReferralComment;
use App\Models\User;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReferralController extends Controller
{

	/**
	 * Display the listing of all Referrals for Internal Users
	 * 
	 * @return json
	 */
	public function index(){
		$referrals = Referral::join('contact', 'tbl_referrals.contact_id', '=', 'contact.contact_id')
		->select('tbl_referrals.*', 'contact.contact_fname', 'contact.contact_lname', 'contact.contact_cpnum', 'contact.contact_email', 'contact.contact_assign_to', 'contact.referred_by')
		->get();

		foreach ($referrals as $referral) {
			$referral->referred_by = Contact::findOrFail($referral->referred_by);
			$referral->date_updated = date('M d, Y', strtotime($referral->date_updated));
			$comments = ReferralComment::where('referral_id', $referral->id);
			if ($comments) {
				$referral->comment_count = $comments->count();
			
				$fetchDateUpdated = ReferralComment::where('referral_id', $referral->id)
				->orderByDesc('date_added')
				->select('date_added')
				->first();
				if ($fetchDateUpdated) {
					$referral->date_updated = date('M d, Y', strtotime($fetchDateUpdated->date_added));
				}
			}
		}

		return response($referrals);
	}

	/**
	 * Show referral By id for Internal Users
	 *
	 * @param [int] $id
	 * @return json
	 */
	public function show($id)
    {		
		$referral = Referral::join('contact', 'tbl_referrals.contact_id', '=', 'contact.contact_id')
		->select('tbl_referrals.*', 'contact.contact_fname', 'contact.contact_lname', 'contact.contact_cpnum', 'contact.referred_by')
		->where('tbl_referrals.id', $id)
		->first();

		$referral->referred_by = Contact::findOrFail($referral->referred_by);
		
		$referral->comment_count = ReferralComment::where('referral_id', $id)->count();
		
		$referral->date_updated = ReferralComment::where('referral_id', $id)
		->orderByDesc('date_added')
		->select('date_added')
		->first();

		return response($referral);
    }

    public function getReferrals(Request $request)
		{

			$user = $request->user();

			$referrals = Referral::join('contact', 'contact.contact_id', '=', 'tbl_referrals.contact_id')
			->where('tbl_referrals.referred_by', '=', $user->contact_id)
			->get(['tbl_referrals.*','contact.*']);
			// ->toSql();

			// dd($referrals);
			return response($referrals);
		}

		public function claimAmount(Request $request)
		{
			$validate_ref_id = $request->validate([
				"refId" => "required"
			]);

			$ref_id = $validate_ref_id['refId'];

			$update = Referral::find($ref_id);
			$update->status = "Claiming";
			

			if (!$update->save()) {
				return response([
					"success" => false
				]);
			}
			return response([
				"success" => true
			]);
		}

		public function getReferralCommentsById($id)
		{
			// $comments = DB::table('tbl_referrals_comments_updates')->where('referral_id', $id)->get();
			// return response($comments);
			$comments = Referral::find($id)->comments;
			foreach($comments as $comment){
				$comment->user_id = User::find($comment->user_id);
			}
			
			return response($comments);
		}

		public function add_comment(Request $request){
			$validate_ref_id = $request->validate([
				"refId" => "required",
				"comment" => "required",
				"user_id" => "required"
				]);

			$ref_id = $validate_ref_id['refId'];
			$comment = $validate_ref_id['comment'];
			$user_id = $validate_ref_id['user_id'];
			
			$referralComment = new ReferralComment;
			$referralComment->comment = $comment;
			$referralComment->referral_id = $ref_id;
			$referralComment->user_id = $user_id;
			$referralComment->save();

			$user = User::find($user_id);
			
			return response([
				"status" => true,
				"user" => $user,
				"data" => $referralComment
			]);
					
				
		}

		
		public function destroy($id)
		{
			$referralComment = ReferralComment::find($id);
			if ($referralComment->delete()) {
				return response([
					"status" => true,
					"message" => "Comment Deleted Successfully"
				]);
			}
			return response([
				"status" => false,
				"message" => "Comment not deleted"
			]);
		}
}