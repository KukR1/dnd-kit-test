//@ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Announcements,
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  DropAnimation,
  Modifier,
  defaultDropAnimation,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty,
} from './utilities';
import type { FlattenedItem, SensorContext, TreeItems } from './types';
import { sortableTreeKeyboardCoordinates } from './keyboardCoordinates';
import { SortableTreeItem } from './components';
import { CSS } from '@dnd-kit/utilities';

const prefferedItems = [
  /* Want to achieve to work with data like that...
Keep in mind that dashboards cannot be folders such as its parent or children, only draggable here and there..*/
  {
    id: 1,
    title: 'Diomedea irrorata',
    is_header: true,
    parent_id: null,
    parent_index: 11,
    visible: true,
    dashboards: [
      {
        id: 1,
        title: 'Cervus canadensis',
        name: 'Cervus canadensis',
        divider_id: 1,
        divider_index: 62,
        visible: true,
      },
    ],
    children: [
      {
        id: 2,
        title: 'Ciconia episcopus',
        is_header: false,
        parent_id: 1,
        parent_index: 2,
        visible: true,
        dashboards: [
          {
            id: 2,
            title: 'Grus antigone',
            name: 'Grus antigone',
            divider_id: 2,
            divider_index: 78,
            visible: true,
          },
        ],
        children: [],
      },
      {
        id: 3,
        title: 'Lama Glama',
        is_header: false,
        parent_id: 1,
        parent_index: 3,
        visible: true,
        dashboards: [
          {
            id: 3,
            title: 'Eubalaena australis',
            name: 'Eubalaena australis',
            divider_id: 3,
            divider_index: 73,
            visible: true,
          },
        ],
        children: [
          {
            id: 4,
            title: 'Zalophus californicus',
            is_header: false,
            parent_id: 3,
            parent_index: 4,
            visible: true,
            dashboards: [
              {
                id: 4,
                title: 'Papilio canadensis',
                name: 'Papilio canadensis',
                divider_id: 4,
                divider_index: 1,
                visible: true,
              },
            ],
          },
        ],
      },
      {
        id: 27,
        title: 'New Category',
        is_header: false,
        parent_id: 1,
        parent_index: 9,
        visible: true,
        dashboards: [
          {
            id: 18,
            title: 'New Page Test',
            name: 'New Page Test',
            divider_id: 27,
            divider_index: 1,
            visible: true,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 6,
    title: 'Junonia genoveua',
    is_header: true,
    parent_id: null,
    parent_index: 16,
    visible: true,
    dashboards: [
      {
        id: 6,
        title: 'Sula dactylatra',
        name: 'Sula sulina',
        divider_id: 6,
        divider_index: 48,
        visible: true,
      },
    ],
    children: [
      {
        id: 7,
        title: 'Acridotheres tristis',
        is_header: false,
        parent_id: 6,
        parent_index: 8,
        visible: true,
        dashboards: [
          {
            id: 7,
            title: 'Sus scrofa',
            name: 'Sus scrofa',
            divider_id: 7,
            divider_index: 31,
            visible: true,
          },
        ],
        children: [
          {
            id: 9,
            title: 'Sagittarius Serpentarius',
            is_header: false,
            parent_id: 7,
            parent_index: 9,
            visible: true,
            dashboards: [
              {
                id: 9,
                title: 'Paradoxurus hermaphroditus',
                name: 'Paradoxurus hermaphroditus',
                divider_id: 9,
                divider_index: 3,
                visible: true,
              },
            ],
          },
        ],
      },
      {
        id: 8,
        title: 'Phalacrocorax niger',
        is_header: false,
        parent_id: 6,
        parent_index: 9,
        visible: true,
        dashboards: [
          {
            id: 8,
            title: 'Vulpes cinereoargenteus',
            name: 'Vulpes cinereoargenteus',
            divider_id: 8,
            divider_index: 51,
            visible: true,
          },
        ],
        children: [
          {
            id: 10,
            title: 'Macropus fuliginosus',
            is_header: false,
            parent_id: 8,
            parent_index: 10,
            visible: true,
            dashboards: [
              {
                id: 10,
                title: 'Otaria flavescens',
                name: 'Otaria flavescens',
                divider_id: 10,
                divider_index: 12,
                visible: true,
              },
            ],
          },
        ],
      },
      {
        id: 18,
        title: 'asda',
        is_header: false,
        parent_id: 6,
        parent_index: 1,
        visible: false,
        dashboards: [],
        children: [],
      },
    ],
  },
  {
    id: 11,
    title: 'dashboard',
    is_header: true,
    parent_id: null,
    parent_index: 10,
    visible: false,
    dashboards: [],
    children: [
      {
        id: 12,
        title: 'cat 1',
        is_header: false,
        parent_id: 11,
        parent_index: 1,
        visible: true,
        dashboards: [
          {
            id: 11,
            title: 'pagina 1',
            name: 'pagina 1',
            divider_id: 12,
            divider_index: 1,
            visible: true,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 13,
    title: 'dash',
    is_header: true,
    parent_id: null,
    parent_index: 9,
    visible: false,
    dashboards: [],
    children: [
      {
        id: 14,
        title: 'cat',
        is_header: false,
        parent_id: 13,
        parent_index: 1,
        visible: true,
        dashboards: [
          {
            id: 12,
            title: 'pagina',
            name: 'pagina',
            divider_id: 14,
            divider_index: 1,
            visible: true,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 15,
    title: 'dashboard',
    is_header: true,
    parent_id: null,
    parent_index: 8,
    visible: false,
    dashboards: [],
    children: [
      {
        id: 16,
        title: 'cat1',
        is_header: false,
        parent_id: 15,
        parent_index: 1,
        visible: true,
        dashboards: [
          {
            id: 13,
            title: 'pagina',
            name: 'pagina',
            divider_id: 16,
            divider_index: 1,
            visible: true,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 17,
    title: 'asda',
    is_header: true,
    parent_id: null,
    parent_index: 7,
    visible: false,
    dashboards: [],
    children: [],
  },
  {
    id: 19,
    title: 'dash',
    is_header: true,
    parent_id: null,
    parent_index: 6,
    visible: false,
    dashboards: [],
    children: [
      {
        id: 20,
        title: 'cat1',
        is_header: false,
        parent_id: 19,
        parent_index: 1,
        visible: true,
        dashboards: [
          {
            id: 14,
            title: 'pag',
            name: 'pag',
            divider_id: 20,
            divider_index: 1,
            visible: true,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 21,
    title: 'dash',
    is_header: true,
    parent_id: null,
    parent_index: 5,
    visible: true,
    dashboards: [],
    children: [
      {
        id: 22,
        title: 'cat',
        is_header: false,
        parent_id: 21,
        parent_index: 2,
        visible: true,
        dashboards: [
          {
            id: 15,
            title: 'pagina',
            name: 'pagina',
            divider_id: 22,
            divider_index: 1,
            visible: true,
          },
        ],
        children: [],
      },
      {
        id: 23,
        title: 'New Cat',
        is_header: false,
        parent_id: 21,
        parent_index: 1,
        visible: true,
        dashboards: [
          {
            id: 16,
            title: 'New Pagina',
            name: 'New Pagina',
            divider_id: 23,
            divider_index: 1,
            visible: true,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 24,
    title: 'New Dashboard',
    is_header: true,
    parent_id: null,
    parent_index: 4,
    visible: true,
    dashboards: [],
    children: [
      {
        id: 25,
        title: 'First Cat',
        is_header: false,
        parent_id: 24,
        parent_index: 1,
        visible: true,
        dashboards: [
          {
            id: 17,
            title: 'Frist Pagina',
            name: 'Frist Pagina',
            divider_id: 25,
            divider_index: 1,
            visible: true,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 26,
    title: 'New Dashboard',
    is_header: true,
    parent_id: null,
    parent_index: 3,
    visible: true,
    dashboards: [],
    children: [],
  },
  {
    id: 28,
    title: 'dashboard',
    is_header: true,
    parent_id: null,
    parent_index: 2,
    visible: true,
    dashboards: [],
    children: [
      {
        id: 29,
        title: 'cat1',
        is_header: false,
        parent_id: 28,
        parent_index: 1,
        visible: true,
        dashboards: [
          {
            id: 19,
            title: 'pagina',
            name: 'pagina',
            divider_id: 29,
            divider_index: 1,
            visible: true,
          },
          {
            id: 20,
            title: 'new dash',
            name: 'new dash',
            divider_id: 29,
            divider_index: 2,
            visible: false,
          },
        ],
        children: [],
      },
    ],
  },
  {
    id: 30,
    title: 'Dashv2',
    is_header: true,
    parent_id: null,
    parent_index: 1,
    visible: true,
    dashboards: [],
    children: [],
  },
];

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

interface Props {
  collapsible?: boolean;
  defaultItems?: TreeItems;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}

export function App({
  collapsible,
  defaultItems = prefferedItems,
  indicator = false,
  indentationWidth = 50,
  removable,
}: Props) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    console.log(flattenedTree);

    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);
  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;
  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth)
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement('onDragMove', active.id, over?.id);
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement('onDragOver', active.id, over?.id);
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement('onDragEnd', active.id, over?.id);
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  return (
    <DndContext
      accessibility={{ announcements }}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems?.map(({ id, children, collapsed, depth, title }) => (
          <SortableTreeItem
            key={id + title}
            id={id}
            value={title ?? ''}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
            indicator={indicator}
            collapsed={Boolean(collapsed && children?.length)}
            onCollapse={
              children?.length
                ? () => {
                    handleCollapse(id);
                  }
                : undefined /* console.log(
                'Just removed it to see the UI of it, cuz it throws error'
              ) */
            }
          />
        ))}
        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimationConfig}
            modifiers={indicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <SortableTreeItem
                id={activeId}
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                value={activeItem.title ?? 'Dragging...'}
                indentationWidth={indentationWidth}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty('cursor', '');
  }

  function handleRemove(id: UniqueIdentifier) {
    setItems((items) => removeItem(items, id));
  }

  function handleCollapse(id: UniqueIdentifier) {
    setItems((items) =>
      setProperty(items, id, 'collapsed', (value) => {
        return !value;
      })
    );
  }

  function getMovementAnnouncement(
    eventName: string,
    activeId: UniqueIdentifier,
    overId?: UniqueIdentifier
  ) {
    if (overId && projected) {
      if (eventName !== 'onDragEnd') {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: UniqueIdentifier | null = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
