<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class EvaluationEvaluator extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $table = 'evaluation_evaluators';

    protected $primaryKey = ['response_id', 'evaluator_id'];
    public $incrementing = false;

    protected $fillable = [
        'response_id',
        'evaluator_id',
        'comment',
        'order',
        'signature_filepath',
        'deleted_at'
    ];

    public function evaluator()
    {
        return $this->belongsTo(UsersModel::class, 'evaluator_id');
    }

    protected function getKeyForSaveQuery()
    {

        $primaryKeyForSaveQuery = array(count($this->primaryKey));
        foreach ($this->primaryKey as $i => $pKey) {
            $primaryKeyForSaveQuery[$i] = isset($this->original[$this->getKeyName()[$i]])
                ? $this->original[$this->getKeyName()[$i]]
                : $this->getAttribute($this->getKeyName()[$i]);
        }
        return $primaryKeyForSaveQuery;

    }

    public function response()
    {
        return $this->belongsTo(EvaluationResponse::class, 'response_id');
    }

    protected function setKeysForSaveQuery($query)
    {

        foreach ($this->primaryKey as $i => $pKey) {
            $query->where($this->getKeyName()[$i], '=', $this->getKeyForSaveQuery()[$i]);
        }

        return $query;
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('signatures')->singleFile();
    }
    
}
