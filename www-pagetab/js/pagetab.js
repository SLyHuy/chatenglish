var Site = (function($, window, undefined) {

	function siteInit() {
		window.fbAsyncInit = function() {
			FB.init({
				appId      : '1449890398617312',
				xfbml      : true,
				version    : 'v2.0'
			});

			// FB.Canvas.setSize({
			// 	width: 800,
			// 	height: 860
			// });

			var isFF = false;
			if (navigator.userAgent.indexOf('Firefox') > 0){
				isFF = true;
			}

			var time = 0;

			function resizeCanvas(){
				var height = $(document.body).outerHeight(true) + 10;
				if (isFF){
					height += 10;
				}
				console.log(height);
				time++;

				FB.Canvas.setSize({
					width: 800,
					height: height
				});
				if (time < 100){
					setTimeout(function(){
						resizeCanvas();
					}, 200);
				}
			}
			resizeCanvas();
		};


		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/vi_VN/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	};

	

	return {
		siteInit: siteInit
	};

})(jQuery, window);

jQuery(function() {
	Site.siteInit();

});