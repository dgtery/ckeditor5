/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
// import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableCaptionEditing from '../../src/tablecaption/tablecaptionediting';
import TableEditing from '../../src/tableediting';

describe.only( 'TableCaptionEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableCaptionEditing, Paragraph, TableCaptionEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableCaptionEditing.pluginName ).to.equal( 'TableCaptionEditing' );
	} );

	it( 'should set proper schema rules', () => {
		// Table:
		expect( model.schema.isRegistered( 'table' ) ).to.be.true;
		expect( model.schema.isObject( 'table' ) ).to.be.true;
		expect( model.schema.isBlock( 'table' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'table' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'headingRows' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'headingColumns' ) ).to.be.true;
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			// TODO;
		} );

		describe( 'view to model', () => {
			describe( 'caption', () => {
				it( 'should convert a table with <caption>', () => {
					editor.setData(
						'<table>' +
							'<caption>Foo caption</caption>' +
							'<tbody>' +
								'<tr>' +
									'<td>' +
										'foobar' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( String(
							'<table>' +
								'<caption>Foo caption</caption>' +
								'<tableRow>' +
									'<tableCell>' +
										'<paragraph>foobar</paragraph>' +
									'</tableCell>' +
								'</tableRow>' +
							'</table>'
						)	);
				} );

				it( 'should convert a table inside <figure> with <figcaption> preceding the table', () => {
					editor.setData(
						'<figure class="table">' +
							'<figcaption>Foo caption</figcaption>' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>' +
											'foobar' +
										'</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( String(
							'<table>' +
								'<caption>' +
									'Foo caption' +
								'</caption>' +
								'<tableRow>' +
									'<tableCell>' +
										'<paragraph>foobar</paragraph>' +
									'</tableCell>' +
								'</tableRow>' +
							'</table>'
						) );
				} );

				// eslint-disable-next-line max-len
				it( 'should convert a table inside <figure> with <figcaption> preceding the table - <figcaption> has higher priority', () => {
					editor.setData(
						'<figure class="table">' +
							'<figcaption>Foo caption</figcaption>' +
							'<table>' +
								'<caption>Bar caption</caption>' +
								'<tbody>' +
									'<tr>' +
										'<td>' +
											'foobar' +
										'</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( String(
							'<paragraph>Foo caption</paragraph>' +
							'<table>' +
								'<caption>Bar caption</caption>' +
								'<tableRow>' +
									'<tableCell>' +
										'foobar' +
									'</tableCell>' +
								'</tableRow>' +
							'</table>'
						) );
				} );
			} );
		} );
	} );
} );