<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PemeResponsesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme_responses';
    protected $fillable = [
        'peme_id',
        'remarks',
        'status',
        'user_id',
        'attachment_path',
    ];
    public function peme()
    {
        return $this->belongsTo(PemeModel::class, 'peme_id');
    }
    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }
}
