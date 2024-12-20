<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortalUpdateComment extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tbl_portal_updates_comments';

		protected $primaryKey = 'portal_update_comment_id';

		const CREATED_AT = 'created_at';
		const UPDATE_AT = 'updated_at';

		public $timestamps = false;

		protected $fillable = [
			"portal_update_comment_id",
			"portal_update_id",
			"sender_contact_id",
			"sender_fullname",
			"sender_profile_url",
			"message",
			"is_removed",
		];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
			'is_removed',
		];


}
