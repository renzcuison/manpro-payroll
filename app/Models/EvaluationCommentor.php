<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationCommentor extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, SoftDeletes;

    protected $table = 'evaluation_commentors';

    protected $primaryKey = 'id';

    protected $fillable = [
        'response_id',
        'commentor_id',
        'comment',
        'order',
        'signature_filepath',
        'deleted_at'
    ];

    public function commentor()
    {
        return $this->belongsTo(UsersModel::class, 'commentor_id');
    }

    public function response()
    {
        return $this->belongsTo(EvaluationResponse::class, 'response_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('signatures')->singleFile();
    }
    
}
