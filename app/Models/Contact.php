<?php

namespace App\Models;
use App\Models\Referral;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Contact extends Authenticatable
{
    use HasFactory, HasApiTokens;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'contact';

		protected $primaryKey = 'contact_id';

		const CREATED_AT = 'contact_date_created';

		public $timestamps = false;

		protected $fillable = [
			"contact_fname",
			"contact_mname",
			"contact_lname",
			"contact_bdate",
			"contact_gender",
			"contact_email",
			"contact_password",
			"contact_fbname",
			"contact_messenger",
			"contact_cpnum",
			"contact_country",
			"contact_city",
			"contact_zip",
			"contact_street",
			"contact_location",
			"contact_assign_to",
			"contact_profile",
			"contact_status",
			"contact_nationality",
			"admin_notification",
			"user_notification",
			"username",
			"push_token",
			"change_pass_code",
			"apple_id"
		];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
			'remember_token',
			'is_removed',
			'admin_notification',
			'user_notification',
			'contact_created_by',
			'change_pass_code'
		];

	public function referrals()
	{
		return $this->hasMany(Referral::class);
	}

	public function transactions()
	{
		return $this->hasMany(FinanceTransaction::class,'val_assign_to');
	}
}