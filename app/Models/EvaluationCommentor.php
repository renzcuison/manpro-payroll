<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationCommentor extends Model
{
    use HasFactory;

    protected $table = 'evaluation_commentors';

    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'response_id',
        'commentor_id',
        'comment',
        'order',
        'signature_filepath',
        'deleted_at'
    ];

    public function response()
    {
        return $this->belongsTo(EvaluationResponse::class, 'response_id');
    }

    public function commentor()
    {
        return $this->belongsTo(UsersModel::class, 'commentor_id');
    }
    
}
