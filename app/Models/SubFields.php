<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubFields extends Model
{
    use HasFactory;

    protected $table = 'child';

    protected $primaryKey = 'child_id';

    public $timestamps = false;

    protected $fillable = [];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

}
