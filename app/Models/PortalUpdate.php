<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortalUpdate extends Model
{
    use HasFactory;
		
		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tbl_portal_updates';

		protected $primaryKey = 'portal_update_id';

		const CREATED_AT = 'date_created';
		const UPDATE_AT = 'date_updated';

		public $timestamps = false;

		protected $fillable = [
			"title",
			"description",
			"file",
			"type",
			"order_no",
			"status",
			"is_deleted",
		];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
			'is_deleted',
		];
}
