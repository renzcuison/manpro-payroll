<?php

namespace App\Models;
use App\Models\Contact;
use App\Models\ReferralComment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    use HasFactory;

    protected $table = 'tbl_referrals';

		public $timestamps = false;

    public function contact()
    {
      return $this->belongsTo(Contact::class);
    }

    public function comments()
    {
      return $this->hasMany(ReferralComment::class);
    }
}