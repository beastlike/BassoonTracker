UI.WaveForm = function(){

	var me = UI.element();
	var currentSampleData;
	var currentSample;
	var isPlaying;
	var isDraggingRange;
	var startPlayTime;
	var sampleRate;
	var sampleLength;
	var dragRangeStart;
	var dragRangeEnd;

	var waveformDisplay = UI.element();

	function isRefreshing(){
		return isPlaying || isDraggingRange;
	}

	EventBus.on(EVENT.screenRefresh,function(){
		if (!isRefreshing()) return;
		if (!me.isVisible()) return;
		me.refresh();
	});

	me.onStartDrag = function(touchData){
		console.error("startDrag",touchData);
		isDraggingRange = true;
		dragRangeStart = dragRangeEnd = touchData.startX - me.left;
	};

	me.onDrag = function(touchData){
		console.error("drag",touchData);
		dragRangeEnd = touchData.dragX - me.left;
	};

	me.onTouchUp = function(touchData){
		console.error("endDrag",touchData);
		isDraggingRange = false;
	};

	me.setSample = function(sample){
		currentSample = sample;
		if (sample){
			currentSampleData = currentSample.data;
			sampleLength = currentSampleData.length;
		}else{
			currentSampleData = undefined;
			sampleLength = 0;
		}
		isPlaying = false;
		waveformDisplay.needsRendering = true;
		me.refresh();
	};

	me.play = function(period){
		isPlaying = true;
		startPlayTime = new Date().getTime();
		sampleRate = PALFREQUENCY / (period*2);
		me.refresh();
	};

	me.render = function(){
		//   TODO: put wave on separate canvas
		if (this.needsRendering) {

			if (waveformDisplay.needsRendering){
				console.error("render waveform");

				waveformDisplay.clearCanvas();
				waveformDisplay.setPosition(0,0);
				waveformDisplay.setSize(me.width,me.height);

				waveformDisplay.ctx.fillStyle = "black";
				waveformDisplay.ctx.fillRect(0, 0, me.width, me.height);
				waveformDisplay.ctx.strokeStyle = 'rgba(120, 255, 50, 0.5)';

				if (currentSampleData && currentSampleData.length && me.width){
					// sample 1 value each pixel
					var step = sampleLength / me.width;
					var mid = me.height/2;

					waveformDisplay.ctx.beginPath();

					for (var i = 0; i<me.width; i++){
						var index = Math.floor(i*step);
						var peak = currentSampleData[index] * me.height;

						if(i === 0) {
							waveformDisplay.ctx.moveTo(i, mid + peak);
						} else {
							waveformDisplay.ctx.lineTo(i,mid + peak);
						}
					}
					waveformDisplay.ctx.stroke();
				}
				waveformDisplay.needsRendering = false;
			}
			me.ctx.drawImage(waveformDisplay.canvas,0,0);


			if (isPlaying && sampleLength){
				var now = new Date().getTime();
				var delta = now - startPlayTime;

				var index = (sampleRate * delta)/1000;

				if (index>sampleLength){
					isPlaying=false;
				}else{
					var pos = (index / sampleLength) * me.width;
					me.ctx.fillStyle = "rgb(241, 162, 71)";
					me.ctx.fillRect(pos,0,2,me.height);
				}

			}

			if (isDraggingRange){
				me.ctx.fillStyle = "rgba(241, 162, 71,0.3)";
				me.ctx.fillRect(dragRangeStart,0,dragRangeEnd-dragRangeStart,me.height);
			}

		}
		this.needsRendering = false;


		me.parentCtx.drawImage(me.canvas,me.left,me.top,me.width,me.height);

	};

	return me;

};

