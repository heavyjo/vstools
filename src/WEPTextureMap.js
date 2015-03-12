VSTOOLS.WEPTextureMap = function( reader, logger ) {

	reader.extend( this );
	logger.extend( this );

	this.read = function( numberOfPalettes ) {

		var log = this.log, hex = VSTOOLS.hex;
		var u8 = this.u8, s8 = this.s8, u32 = this.u32, skip = this.skip;

		log("textureMap at " + hex( this.reader.pos() ) );

		var size = this.size = u32();
		skip(1); // unknown, always 1?
		var width = this.width = u8() * 2;
		var height = this.height = u8() * 2;
		var colorsPerPalette = this.colorsPerPalette = u8();

		log("size: " + size);
		log("width: " + width);
		log("height: " + height);
		log("numberOfPalettes: " + numberOfPalettes);
		log("colorsPerPalette: " + colorsPerPalette);

		var palettes = this.palettes = [];

		for ( var i = 0; i < numberOfPalettes; ++i) {

			var palette = new VSTOOLS.WEPPalette( this.reader );
			palette.read( this.colorsPerPalette );

			palettes.push( palette );

		}

		var map = this.map = [];

		for ( var y = 0; y < height; ++y ) {

			for ( var x = 0; x < width; ++x ) {

				if ( !map[x] ) map[x] = [];

				map[x][y] = u8();

			}

		}

		log("textureMap done");

	};

	this.build = function( palette ) {

		var buffer = [];
		var i = 0;
		var width = this.width, height = this.height;
		var palettes = this.palettes, colorsPerPalette = this.colorsPerPalette;
		var map = this.map;

		for ( var y = 0; y < height; ++y ) {

			for ( var x = 0; x < width; ++x ) {

				c = map[x][y];
				// TODO sometimes c >= colorsPerPalette?? setting black
				if ( c < colorsPerPalette ) {

					buffer.push(
						palettes[palette].colors[c][0],
						palettes[palette].colors[c][1],
						palettes[palette].colors[c][2],
						palettes[palette].colors[c][3]
					);

				} else {

					buffer.push( 0, 0, 0, 0 );

				}

				i += 4;

			}

		}

		this.texture = new THREE.DataTexture( new Uint8Array( buffer ), width, height, THREE.RGBAFormat );
		//this.texture.generateMipMaps = false;
		this.texture.magFilter = THREE.NearestFilter;
		//this.texture.minFilter = THREE.NearestFilter;
		//this.texture.anisotropy = 16;
		this.texture.needsUpdate = true;

	};

};