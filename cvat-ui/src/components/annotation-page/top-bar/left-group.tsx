// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Col } from 'antd/lib/grid';
import Icon, { StopOutlined, CheckOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import Timeline from 'antd/lib/timeline';
import Dropdown from 'antd/lib/dropdown';

import AnnotationMenuContainer from 'containers/annotation-page/top-bar/annotation-menu';
import {
    MainMenuIcon, SaveIcon, UndoIcon, RedoIcon,
} from 'icons';
import { ActiveControl, ToolsBlockerState } from 'reducers/interfaces';
import CVATTooltip from 'components/common/cvat-tooltip';

interface Props {
    saving: boolean;
    savingStatuses: string[];
    undoAction?: string;
    redoAction?: string;
    saveShortcut: string;
    undoShortcut: string;
    redoShortcut: string;
    drawShortcut: string;
    switchToolsBlockerShortcut: string;
    toolsBlockerState: ToolsBlockerState;
    activeControl: ActiveControl;
    onSaveAnnotation(): void;
    onUndoClick(): void;
    onRedoClick(): void;
    onFinishDraw(): void;
    onSwitchToolsBlockerState(): void;
}

function LeftGroup(props: Props): JSX.Element {
    const {
        saving,
        savingStatuses,
        undoAction,
        redoAction,
        saveShortcut,
        undoShortcut,
        redoShortcut,
        drawShortcut,
        switchToolsBlockerShortcut,
        activeControl,
        toolsBlockerState,
        onSaveAnnotation,
        onUndoClick,
        onRedoClick,
        onFinishDraw,
        onSwitchToolsBlockerState,
    } = props;

    const includesDoneButton = [
        ActiveControl.DRAW_POLYGON,
        ActiveControl.DRAW_POLYLINE,
        ActiveControl.DRAW_POINTS,
        ActiveControl.AI_TOOLS,
        ActiveControl.OPENCV_TOOLS,
    ].includes(activeControl);

    const includesToolsBlockerButton =
        [ActiveControl.OPENCV_TOOLS, ActiveControl.AI_TOOLS].includes(activeControl) && toolsBlockerState.buttonVisible;

    const shouldEnableToolsBlockerOnClick = [ActiveControl.OPENCV_TOOLS].includes(activeControl);

    return (
        <>
            <Modal title='Saving changes on the server' visible={saving} footer={[]} closable={false}>
                <Timeline pending={savingStatuses[savingStatuses.length - 1] || 'Pending..'}>
                    {savingStatuses.slice(0, -1).map((status: string, id: number) => (
                        <Timeline.Item key={id}>{status}</Timeline.Item>
                    ))}
                </Timeline>
            </Modal>
            <Col className='cvat-annotation-header-left-group'>
                <Dropdown overlay={<AnnotationMenuContainer />}>
                    <Button type='link' className='cvat-annotation-header-button'>
                        <Icon component={MainMenuIcon} />
                        菜单
                    </Button>
                </Dropdown>
                <CVATTooltip overlay={`Save current changes ${saveShortcut}`}>
                    <Button
                        onClick={saving ? undefined : onSaveAnnotation}
                        type='link'
                        className={saving ? 'cvat-annotation-disabled-header-button' : 'cvat-annotation-header-button'}
                    >
                        <Icon component={SaveIcon} />
                        {saving ? '保存中...' : '保存'}
                    </Button>
                </CVATTooltip>
                <CVATTooltip overlay={`Undo: ${undoAction} ${undoShortcut}`}>
                    <Button
                        style={{ pointerEvents: undoAction ? 'initial' : 'none', opacity: undoAction ? 1 : 0.5 }}
                        type='link'
                        className='cvat-annotation-header-button'
                        onClick={onUndoClick}
                    >
                        <Icon component={UndoIcon} />
                        <span>撤销</span>
                    </Button>
                </CVATTooltip>
                <CVATTooltip overlay={`Redo: ${redoAction} ${redoShortcut}`}>
                    <Button
                        style={{ pointerEvents: redoAction ? 'initial' : 'none', opacity: redoAction ? 1 : 0.5 }}
                        type='link'
                        className='cvat-annotation-header-button'
                        onClick={onRedoClick}
                    >
                        <Icon component={RedoIcon} />
                        恢复
                    </Button>
                </CVATTooltip>
                {includesDoneButton ? (
                    <CVATTooltip overlay={`Press "${drawShortcut}" to finish`}>
                        <Button type='link' className='cvat-annotation-header-button' onClick={onFinishDraw}>
                            <CheckOutlined />
                            完成
                        </Button>
                    </CVATTooltip>
                ) : null}
                {includesToolsBlockerButton ? (
                    <CVATTooltip overlay={`Press "${switchToolsBlockerShortcut}" to postpone running the algorithm `}>
                        <Button
                            type='link'
                            className={`cvat-annotation-header-button ${
                                toolsBlockerState.algorithmsLocked ? 'cvat-button-active' : ''
                            }`}
                            onClick={shouldEnableToolsBlockerOnClick ? onSwitchToolsBlockerState : undefined}
                        >
                            <StopOutlined />
                            暂停算法
                        </Button>
                    </CVATTooltip>
                ) : null}
            </Col>
        </>
    );
}

export default React.memo(LeftGroup);
