<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'contact';

		protected $primaryKey = 'contact_id';

		const CREATED_AT = 'contact_date_created';

		public $timestamps = false;

		protected $fillable = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
			'contact_password',
			'remember_token',
			'is_removed',
			'admin_notification',
			'user_notification',
			'contact_created_by'
		];

}
