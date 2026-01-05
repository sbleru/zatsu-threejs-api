# AnimationAction

https://threejs.org/docs/#AnimationAction

### An instance of `AnimationAction` schedules the playback of an animation which is stored in [AnimationClip](https://threejs.org/docs/pages/AnimationClip.html).

# Constructor

### new [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html#AnimationAction)( mixer : [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html), clip : [AnimationClip](https://threejs.org/docs/pages/AnimationClip.html), localRoot : [Object3D](https://threejs.org/docs/pages/Object3D.html), blendMode : [NormalAnimationBlendMode](https://threejs.org/docs/pages/global.html#NormalAnimationBlendMode) | [AdditiveAnimationBlendMode](https://threejs.org/docs/pages/global.html#AdditiveAnimationBlendMode) )

Constructs a new animation action.

| **mixer**          | The mixer that is controlled by this action.        |
| ------------------ | --------------------------------------------------- |
| **clip**           | The animation clip that holds the actual keyframes. |
| **localRoot**      | The root object on which this action is performed.  |
| Default is `null`. |
| **blendMode**      | The blend mode.                                     |

# Properties

### .[blendMode](https://threejs.org/docs/pages/AnimationAction.html#blendMode) : [NormalAnimationBlendMode](https://threejs.org/docs/pages/global.html#NormalAnimationBlendMode) | [AdditiveAnimationBlendMode](https://threejs.org/docs/pages/global.html#AdditiveAnimationBlendMode)

Defines how the animation is blended/combined when two or more animations are simultaneously played.

### .[clampWhenFinished](https://threejs.org/docs/pages/AnimationAction.html#clampWhenFinished) : boolean

If set to true the animation will automatically be paused on its last frame.

If set to false, [AnimationAction#enabled](https://threejs.org/docs/pages/AnimationAction.html#enabled) will automatically be switched to `false` when the last loop of the action has finished, so that this action has no further impact.

Note: This member has no impact if the action is interrupted (it has only an effect if its last loop has really finished).

Default is `false`.

### .[enabled](https://threejs.org/docs/pages/AnimationAction.html#enabled) : boolean

If set to `false`, the action is disabled so it has no impact.

When the action is re-enabled, the animation continues from its current time (setting `enabled` to `false` doesn't reset the action).

Default is `true`.

### .[loop](https://threejs.org/docs/pages/AnimationAction.html#loop) : [LoopRepeat](https://threejs.org/docs/pages/global.html#LoopRepeat) | [LoopOnce](https://threejs.org/docs/pages/global.html#LoopOnce) | [LoopPingPong](https://threejs.org/docs/pages/global.html#LoopPingPong)

The loop mode, set via [AnimationAction#setLoop](https://threejs.org/docs/pages/AnimationAction.html#setLoop).

Default is `LoopRepeat`.

### .[paused](https://threejs.org/docs/pages/AnimationAction.html#paused) : boolean

If set to `true`, the playback of the action is paused.

Default is `false`.

### .[repetitions](https://threejs.org/docs/pages/AnimationAction.html#repetitions) : number

The number of repetitions of the performed clip over the course of this action. Can be set via [AnimationAction#setLoop](https://threejs.org/docs/pages/AnimationAction.html#setLoop).

Setting this number has no effect if [AnimationAction#loop](https://threejs.org/docs/pages/AnimationAction.html#loop) is set to `THREE:LoopOnce`.

Default is `Infinity`.

### .[time](https://threejs.org/docs/pages/AnimationAction.html#time) : number

The local time of this action (in seconds, starting with `0`).

The value gets clamped or wrapped to `[0,clip.duration]` (according to the loop state).

Default is `Infinity`.

### .[timeScale](https://threejs.org/docs/pages/AnimationAction.html#timeScale) : number

Scaling factor for the [AnimationAction#time](https://threejs.org/docs/pages/AnimationAction.html#time). A value of `0` causes the animation to pause. Negative values cause the animation to play backwards.

Default is `1`.

### .[weight](https://threejs.org/docs/pages/AnimationAction.html#weight) : number

The degree of influence of this action (in the interval `[0, 1]`). Values between `0` (no impact) and `1` (full impact) can be used to blend between several actions.

Default is `1`.

### .[zeroSlopeAtEnd](https://threejs.org/docs/pages/AnimationAction.html#zeroSlopeAtEnd) : boolean

Enables smooth interpolation without separate clips for start, loop and end.

Default is `true`.

### .[zeroSlopeAtStart](https://threejs.org/docs/pages/AnimationAction.html#zeroSlopeAtStart) : boolean

Enables smooth interpolation without separate clips for start, loop and end.

Default is `true`.

# Methods

### .[crossFadeFrom](https://threejs.org/docs/pages/AnimationAction.html#crossFadeFrom)( fadeOutAction : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html), duration : number, warp : boolean ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Causes this action to fade in and the given action to fade out, within the passed time interval.

| **fadeOutAction**   | The animation action to fade out.      |
| ------------------- | -------------------------------------- |
| **duration**        | The duration of the fade.              |
| **warp**            | Whether warping should be used or not. |
| Default is `false`. |

**Returns:** A reference to this animation action.

### .[crossFadeTo](https://threejs.org/docs/pages/AnimationAction.html#crossFadeTo)( fadeInAction : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html), duration : number, warp : boolean ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Causes this action to fade out and the given action to fade in, within the passed time interval.

| **fadeInAction**    | The animation action to fade in.       |
| ------------------- | -------------------------------------- |
| **duration**        | The duration of the fade.              |
| **warp**            | Whether warping should be used or not. |
| Default is `false`. |

**Returns:** A reference to this animation action.

### .[fadeIn](https://threejs.org/docs/pages/AnimationAction.html#fadeIn)( duration : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Fades the animation in by increasing its weight gradually from `0` to `1`, within the passed time interval.

| **duration** | The duration of the fade. |
| ------------ | ------------------------- |

**Returns:** A reference to this animation action.

### .[fadeOut](https://threejs.org/docs/pages/AnimationAction.html#fadeOut)( duration : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Fades the animation out by decreasing its weight gradually from `1` to `0`, within the passed time interval.

| **duration** | The duration of the fade. |
| ------------ | ------------------------- |

**Returns:** A reference to this animation action.

### .[getClip](https://threejs.org/docs/pages/AnimationAction.html#getClip)() : [AnimationClip](https://threejs.org/docs/pages/AnimationClip.html)

Returns the animation clip of this animation action.

**Returns:** The animation clip.

### .[getEffectiveTimeScale](https://threejs.org/docs/pages/AnimationAction.html#getEffectiveTimeScale)() : number

Returns the effective time scale of this action.

**Returns:** The effective time scale.

### .[getEffectiveWeight](https://threejs.org/docs/pages/AnimationAction.html#getEffectiveWeight)() : number

Returns the effective weight of this action.

**Returns:** The effective weight.

### .[getMixer](https://threejs.org/docs/pages/AnimationAction.html#getMixer)() : [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html)

Returns the animation mixer of this animation action.

**Returns:** The animation mixer.

### .[getRoot](https://threejs.org/docs/pages/AnimationAction.html#getRoot)() : [Object3D](https://threejs.org/docs/pages/Object3D.html)

Returns the root object of this animation action.

**Returns:** The root object.

### .[halt](https://threejs.org/docs/pages/AnimationAction.html#halt)( duration : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Decelerates this animation's speed to `0` within the passed time interval.

| **duration** | The duration. |
| ------------ | ------------- |

**Returns:** A reference to this animation action.

### .[isRunning](https://threejs.org/docs/pages/AnimationAction.html#isRunning)() : boolean

Returns `true` if the animation is running.

**Returns:** Whether the animation is running or not.

### .[isScheduled](https://threejs.org/docs/pages/AnimationAction.html#isScheduled)() : boolean

Returns `true` when [AnimationAction#play](https://threejs.org/docs/pages/AnimationAction.html#play) has been called.

**Returns:** Whether the animation is scheduled or not.

### .[play](https://threejs.org/docs/pages/AnimationAction.html#play)() : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Starts the playback of the animation.

**Returns:** A reference to this animation action.

### .[reset](https://threejs.org/docs/pages/AnimationAction.html#reset)() : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Resets the playback of the animation.

**Returns:** A reference to this animation action.

### .[setDuration](https://threejs.org/docs/pages/AnimationAction.html#setDuration)( duration : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Sets the duration for a single loop of this action.

| **duration** | The duration to set. |
| ------------ | -------------------- |

**Returns:** A reference to this animation action.

### .[setEffectiveTimeScale](https://threejs.org/docs/pages/AnimationAction.html#setEffectiveTimeScale)( timeScale : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Sets the effective time scale of this action.

An action has no effect and thus an effective time scale of zero when the action is paused.

| **timeScale** | The time scale to set. |
| ------------- | ---------------------- |

**Returns:** A reference to this animation action.

### .[setEffectiveWeight](https://threejs.org/docs/pages/AnimationAction.html#setEffectiveWeight)( weight : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Sets the effective weight of this action.

An action has no effect and thus an effective weight of zero when the action is disabled.

| **weight** | The weight to set. |
| ---------- | ------------------ |

**Returns:** A reference to this animation action.

### .[setLoop](https://threejs.org/docs/pages/AnimationAction.html#setLoop)( mode : [LoopRepeat](https://threejs.org/docs/pages/global.html#LoopRepeat) | [LoopOnce](https://threejs.org/docs/pages/global.html#LoopOnce) | [LoopPingPong](https://threejs.org/docs/pages/global.html#LoopPingPong), repetitions : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Configures the loop settings for this action.

| **mode**        | The loop mode.             |
| --------------- | -------------------------- |
| **repetitions** | The number of repetitions. |

**Returns:** A reference to this animation action.

### .[startAt](https://threejs.org/docs/pages/AnimationAction.html#startAt)( time : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Defines the time when the animation should start.

| **time** | The start time in seconds. |
| -------- | -------------------------- |

**Returns:** A reference to this animation action.

### .[stop](https://threejs.org/docs/pages/AnimationAction.html#stop)() : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Stops the playback of the animation.

**Returns:** A reference to this animation action.

### .[stopFading](https://threejs.org/docs/pages/AnimationAction.html#stopFading)() : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Stops any fading which is applied to this action.

**Returns:** A reference to this animation action.

### .[stopWarping](https://threejs.org/docs/pages/AnimationAction.html#stopWarping)() : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Stops any scheduled warping which is applied to this action.

**Returns:** A reference to this animation action.

### .[syncWith](https://threejs.org/docs/pages/AnimationAction.html#syncWith)( action : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html) ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Synchronizes this action with the passed other action.

| **action** | The action to sync with. |
| ---------- | ------------------------ |

**Returns:** A reference to this animation action.

### .[warp](https://threejs.org/docs/pages/AnimationAction.html#warp)( startTimeScale : number, endTimeScale : number, duration : number ) : [AnimationAction](https://threejs.org/docs/pages/AnimationAction.html)

Changes the playback speed, within the passed time interval, by modifying [AnimationAction#timeScale](https://threejs.org/docs/pages/AnimationAction.html#timeScale) gradually from `startTimeScale` to `endTimeScale`.

| **startTimeScale** | The start time scale. |
| ------------------ | --------------------- |
| **endTimeScale**   | The end time scale.   |
| **duration**       | The duration.         |

**Returns:** A reference to this animation action.

# Source

[src/animation/AnimationAction.js](https://github.com/mrdoob/three.js/blob/master/src/animation/AnimationAction.js)
