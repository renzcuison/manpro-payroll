<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientSeenNotif extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tbl_client_seen_notif';

		protected $primaryKey = 'id';

		public $timestamps = false;

		protected $fillable = [
			"contact_id",
			"portal_update_id"
		];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];
}
