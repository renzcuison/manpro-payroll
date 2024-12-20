<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactSocial extends Model
{
    use HasFactory;

			/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'contact_socials';

		protected $primaryKey = 'social_id';

		public $timestamps = true;

		protected $fillable = [
			"social_provider_id",
			"social_provider",
			"social_contact_id",
			"is_unlinked"
		];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
			"social_provider_id",
		];
		
}
