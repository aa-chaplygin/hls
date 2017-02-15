/*
	Функции hash-кодирования
*/
var Hash = (function() {
	
	return {
		
		hash: function(str) {
			
			
			var i, x, hval = 0;
			var l = str.length;
			ret = "";

			console.log('AAA l = ', l);

			for (x = 0; x < 5; x++) {
				
				/*
				for (i = 1; i < l; i++) {
					hval ^= str.charCodeAt(i);
					hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
				}
				*/

				// по всему
				/*
				for(var index in str) {
					hval ^= str[index];
					hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
				}
				*/
			   
				// начало-середина-конец
				/*
				var d = 10000;
				for (i = 1; i < d; i++) {
					hval ^= str[i];
					hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
				}
				for (i = Math.floor(l/2)-d/2; i < Math.floor(l/2)+d/2; i++) {
					hval ^= str[i];
					hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
				}
				for (i = l-d; i < l; i++) {
					hval ^= str[i];
					hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
				}
				*/
				
				// равномерно выборочно
				var
					k = 30000,
					step = Math.floor(l/k);
								
				for (i = 1; i < l; i+= step) {
					hval ^= str[i];
					hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
				}
				
				if (x)
					ret += (hval >>> 0).toString(16);
			}
			
			return ret;

		}
	};
	
})();
