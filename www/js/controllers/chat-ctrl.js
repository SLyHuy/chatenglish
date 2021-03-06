ChatApp.controller('ChatCtrl', function($scope, $state, $timeout, $interval, $ionicScrollDelegate, $ionicPopover, $ionicModal, $ionicPopup, $ionicNavBarDelegate, chatService){
	$scope.title = 'Chat English';
	$scope.chats = [];
	$scope.reportData = {};

	$scope.inBlockList = false;
	var blocks = [];
	var isBlock = false;


	//$scope.haveStranger = true;
	//$scope.strangerLiked = true;

	//console.log(userData);

	function initChat(){

		var localBlocks = window.localStorage.getItem('blocks');
		if (localBlocks && userData.userID){
			blocks = JSON.parse(localBlocks)[userData.userID];
			if (!blocks){
				blocks = [];
				window.localStorage.removeItem('blocks');
			}
		}

		console.log(blocks);

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
		if (data.stranger){
			$scope.haveStranger = true;			
			$scope.strangerLiked = data.stranger.isLiked;

			$scope.infoStranger = {
				fullId: data.stranger.id,
				shortId: parseInt(data.stranger.id, 10),
				liked: data.stranger.liked,
				name: data.stranger.name,
				avatar: data.stranger.avatar
			};

			//Check blocklist
			if (data.from == 'system'){
				for (var i = 0; i < blocks.length; i++){
					if (blocks[i] == data.stranger.id){
						isBlock = true;
						$scope.inBlockList = true;
						break;
					}
				}

				if (isBlock){
					$ionicPopup.confirm({
						title: '',
						template: '<h4 class="title text-center">Stranger was blocked by you. Do you want to continue to chat with him?</h4>',
						cancelText: 'Yes',
						okText: 'No, I don\'t.'
					}).then(function(res){
						if (!res){
							//Yes
							isBlock = false;
						}
						else {
							//No
							chatService.exit();
							$ionicNavBarDelegate.back();
						}
					});
				}
			}
			
		}

		if (content){
			if (isBlock && data.from == 'stranger'){

			}
			else{
				$scope.chats.push(content);
			}			
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
		$scope.infoStranger.liked++;

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

	$ionicModal.fromTemplateUrl('templates/info-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.infoModal = modal;
	});

	$scope.openInfoModal = function(){
		$scope.infoModal.show();
	};

	$scope.closeInfoModal = function(){
		$scope.infoModal.hide();
		$scope.popoverChat.hide();
	};

	$scope.blockStranger = function(){
		var template = '<h4 class="title text-center">Do you want block stranger and exit?</h4>';
		if ($scope.inBlockList){
			template = '<h4 class="title text-center">Do you want unblock stranger?</h4>';
		}
		$ionicPopup.confirm({
			title: '',
			template: template,
			okText: 'Yes'
		}).then(function(res){
			if (res){
				if ($scope.inBlockList == false){
					blocks.push($scope.infoStranger.fullId);

					var obj = {};
					obj[userData.userID] = blocks;
					window.localStorage.setItem('blocks', JSON.stringify(obj));

					$scope.inBlockList = true;

					$scope.popoverChat.hide();
					chatService.exit();
					$ionicNavBarDelegate.back();
				}
				else{
					for (var i = 0; i < blocks.length; i++){
						if (blocks[i] == $scope.infoStranger.fullId){
							blocks.splice(i, 1);
							break;
						}
					}

					var obj = {};
					obj[userData.userID] = blocks;
					window.localStorage.setItem('blocks', JSON.stringify(obj));

					$scope.inBlockList = false;
					isBlock = false;
					$scope.popoverChat.hide();
				}				
			}
			else {
				
			}
		});
		
	};


	initChat();
});


ChatApp.controller('navBarCtrl', function($scope, $state, $ionicNavBarDelegate, chatService){
	$scope.exit = function(){
		//console.log('User exit!!');
		chatService.exit();

		$ionicNavBarDelegate.back();
	}
});