ChatApp.controller('ChatCtrl', function($scope, $state, $timeout, $interval, $ionicScrollDelegate, $ionicPopover, $ionicModal, $ionicPopup, chatService){
	$scope.title = 'Chat English';
	$scope.chats = [];
	$scope.reportData = {};

	//$scope.haveStranger = true;
	//$scope.strangerLiked = true;

	console.log(userData);

	function initChat(){		
		chatService.init({
			callbackSendMessage: function(){},
			callbackReceiveMessage: receiveChat,
			callbackConnect: function(){},
			callbackClose: onClose
		});
	};

	function onClose(){
		$scope.$apply(function(){
			$scope.chats.push({
				type: 'system',
				content: 'You has been disconnected, please exit and make new chat.'
			});
			$ionicScrollDelegate.scrollBottom(true);
		});
	}

	var isTyping = false;
	var timer;
	var lastTimeKeyPress = 0;
	var typingEle;

	function receiveChat(data){
		var content;

		if ($scope.chats.length > 0){
			if ($scope.chats[$scope.chats.length - 1].type == 'typing'){
				$scope.chats.pop();
			}
		}

		if (data.type == 'chat'){
			content = {
				type: data.from == 'system' ? 'system' : 'stranger',
				content : data.message
			};

			if (timer){
				isTyping = false;
				$interval.cancel(timer);
			}

		}
		else if (data.type == 'action'){
			if (data.action == 'typing'){
				content = {
					type: 'typing'
				};
			}
			else{
				
			}
		}

		//Check Like function
		if (data.type == 'chat' && data.from == 'system' && data.stranger){
			$scope.haveStranger = true;			
			$scope.strangerLiked = data.stranger.isLiked;
		}

		if (content){
			$scope.chats.push(content);
		}
		
		$scope.$apply(function(){			
			$ionicScrollDelegate.scrollBottom(true);
		});
	}

	

	$scope.sendChat = function(){
		var that = this;
		that.newChat = that.newChat.trim().replace(/\s{2,}/g, ' ');
		var newChat = that.newChat;
		if (newChat && newChat !== ''){
			if (timer){
				isTyping = false;
				$interval.cancel(timer);
			}


			chatService.sendMessage({
				type: 'chat',
				message: newChat
			});

			var content = {
				type: 'me',
				content : newChat
			};

			if ($scope.chats.length > 0 && $scope.chats[$scope.chats.length - 1].type == 'typing'){
				$scope.chats.splice($scope.chats.length - 1, 0, content);
			}
			else{
				$scope.chats.push(content);
			}
			
			$ionicScrollDelegate.scrollBottom(true);

		}

		that.newChat = '';
		$scope.focusInput = true;
	};

	$scope.chatKeyPress = function(e){
		lastTimeKeyPress = e.timeStamp;
		if (isTyping == false){
			isTyping = true;
			chatService.sendMessage({
				type: 'action',
				action: 'typing'
			});
			$interval.cancel(timer);
			timer = $interval(function(){
				if (isTyping && (new Date()).getTime() - lastTimeKeyPress > 4000){
					isTyping = false;
					$interval.cancel(timer);
					chatService.sendMessage({
						type: 'action',
						action: 'stop type'
					});
				}
			}, 1000);
		}
		else{

		}
	}

	$scope.likeStranger = function(){
		if ($scope.strangerLiked){
			return false;
		}
		$scope.strangerLiked = true;

		chatService.sendMessage({
			type: 'action',
			action: 'like'
		});

		$scope.popoverChat.hide();

		var content = {
			type: 'system',
			content : 'You\'ve just like the stranger. Thank you.'
		};

		$scope.chats.push(content);
		$ionicScrollDelegate.scrollBottom(true);
	};

	$ionicPopover.fromTemplateUrl('templates/popover.html', {
		scope: $scope,
	}).then(function(popover) {
    	$scope.popoverChat = popover;
	});

	$scope.showPopoverChat = function($event){
		$scope.popoverChat.show($event);
	};

	$ionicModal.fromTemplateUrl('templates/report-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.reportModal = modal;
	});

	$scope.openReportModal = function(){
		if ($scope.reported){
			return false;
		}
		$scope.reportModal.show();
	};

	$scope.closeReportModal = function(){
		$scope.reportModal.hide();
	};

	$scope.sendReport = function(){
		if ($scope.reported){
			return false;
		}

		if (!$scope.reportData.reason){
			$ionicPopup.alert({
				template: '<h4 class="title text-center">Please choose reason</h4>'
			});
		}
		else{
			chatService.sendMessage({
				type: 'report',
				reason: $scope.reportData.reason
			});
			$scope.reported = true;

			$ionicPopup.alert({
				template: '<h4 class="title text-center">Your report has been sent. Thank you.</h4>'
			}).then(function(){
				$scope.reportModal.hide();
				$scope.popoverChat.hide();
			});

		}
	};




	initChat();
});


ChatApp.controller('navBarCtrl', function($scope, $state, $ionicNavBarDelegate, chatService){
	$scope.exit = function(){
		console.log('User exit!!');
		chatService.exit();

		$ionicNavBarDelegate.back();
	}
});