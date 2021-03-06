// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Popover from 'antd/lib/popover';
import Icon,{AppstoreFilled} from '@ant-design/icons';

import { Canvas } from 'cvat-canvas-wrapper';
import { RectangleIcon } from 'icons';
import { ShapeType } from 'reducers/interfaces';

import DrawShapePopoverContainer from 'containers/annotation-page/standard-workspace/controls-side-bar/draw-shape-popover';
import withVisibilityHandling from './handle-popover-visibility';

export interface Props {
    canvasInstance: Canvas;
    isDrawing: boolean;
    disabled?: boolean;
}

const CustomPopover = withVisibilityHandling(Popover, 'draw-rectangle');
function DrawRectangleControl(props: Props): JSX.Element {
    const { canvasInstance, isDrawing, disabled } = props;
    const dynamcPopoverPros = isDrawing ?
        {
            overlayStyle: {
                display: 'none',
            },
        } :
        {};

    const dynamicIconProps = isDrawing ?
        {
            className: 'cvat-draw-rectangle-control cvat-active-canvas-control',
            onClick: (): void => {
                canvasInstance.draw({ enabled: false });
            },
        } :
        {
            className: 'cvat-draw-rectangle-control',
        };

    return disabled ? (
        <Icon className='cvat-draw-rectangle-control cvat-disabled-canvas-control' component={AppstoreFilled} style={{ fontSize: '40px' }} />
    ) : (
        <CustomPopover
            {...dynamcPopoverPros}
            overlayClassName='cvat-draw-shape-popover'
            placement='right'
            content={<DrawShapePopoverContainer shapeType={ShapeType.RECTANGLE} />}
        >
            <Icon {...dynamicIconProps} component={AppstoreFilled} style={{ fontSize: '40px' }} />
        </CustomPopover>
    );
}

export default React.memo(DrawRectangleControl);
