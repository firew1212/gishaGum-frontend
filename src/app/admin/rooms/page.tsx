'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';

import {
  createRoom,
  deleteRoom,
  getAdminRoomTypes,
  getAdminRooms,
  updateRoom,
  type Room,
  type RoomStatus,
  type RoomType,
} from '@/src/lib/admin-rooms-api';

type ModalMode = 'create' | 'edit' | null;

interface RoomFormState {
  roomNumber: string;
  floor: string;
  roomTypeId: string;
  status: RoomStatus;
}

const ROOM_STATUSES: RoomStatus[] = [
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
];

const EMPTY_FORM: RoomFormState = {
  roomNumber: '',
  floor: '',
  roomTypeId: '',
  status: 'AVAILABLE',
};

function formatRoomStatus(status: RoomStatus): string {
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character: string) => character.toUpperCase(),
    );
}

function getRoomStatusClass(status: RoomStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'status-badge status-badge-success';

    case 'OCCUPIED':
      return 'status-badge status-badge-info';

    case 'MAINTENANCE':
      return 'status-badge status-badge-warning';

    case 'OUT_OF_SERVICE':
      return 'status-badge status-badge-danger';

    default:
      return 'status-badge';
  }
}

function formatPrice(price: number | string): string {
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AdminRoomsPage() {
  const { accessToken } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [formError, setFormError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | RoomStatus
  >('ALL');
  const [floorFilter, setFloorFilter] = useState('ALL');

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(
    null,
  );

  const [form, setForm] =
    useState<RoomFormState>(EMPTY_FORM);

  const [roomToDelete, setRoomToDelete] =
    useState<Room | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [roomsData, roomTypesData] = await Promise.all([
        getAdminRooms(),
        getAdminRoomTypes(),
      ]);

      setRooms(roomsData);
      setRoomTypes(roomTypesData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load room information.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const availableFloors = useMemo(() => {
    return Array.from(
      new Set(rooms.map((room) => room.floor)),
    ).sort((a, b) => a - b);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        room.roomNumber
          .toLowerCase()
          .includes(normalizedSearch) ||
        room.roomType.name
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'ALL' ||
        room.status === statusFilter;

      const matchesFloor =
        floorFilter === 'ALL' ||
        room.floor.toString() === floorFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFloor
      );
    });
  }, [
    rooms,
    searchTerm,
    statusFilter,
    floorFilter,
  ]);

  function openCreateModal() {
    setSelectedRoom(null);
    setForm({
      ...EMPTY_FORM,
      roomTypeId: roomTypes[0]?.id ?? '',
    });
    setFormError('');
    setModalMode('create');
  }

  function openEditModal(room: Room) {
    setSelectedRoom(room);

    setForm({
      roomNumber: room.roomNumber,
      floor: room.floor.toString(),
      roomTypeId: room.roomTypeId,
      status: room.status,
    });

    setFormError('');
    setModalMode('edit');
  }

  function closeFormModal() {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setSelectedRoom(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  function updateFormField(
    field: keyof RoomFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!accessToken) {
      setFormError(
        'Your session has expired. Please log in again.',
      );
      return;
    }

    const roomNumber = form.roomNumber.trim();
    const floor = Number(form.floor);

    if (!roomNumber) {
      setFormError('Room number is required.');
      return;
    }

    if (!Number.isInteger(floor) || floor < 0) {
      setFormError(
        'Floor must be a valid whole number.',
      );
      return;
    }

    if (!form.roomTypeId) {
      setFormError('Please select a room type.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (modalMode === 'create') {
        /*
         * Do not send status.
         * The backend automatically creates new rooms
         * with status AVAILABLE.
         */
        await createRoom(
          {
            roomNumber,
            floor,
            roomTypeId: form.roomTypeId,
          },
          accessToken,
        );
      }

      if (modalMode === 'edit' && selectedRoom) {
        await updateRoom(
          selectedRoom.id,
          {
            roomNumber,
            floor,
            roomTypeId: form.roomTypeId,
            status: form.status,
          },
          accessToken,
        );
      }

      setModalMode(null);
      setSelectedRoom(null);
      setForm(EMPTY_FORM);
      setFormError('');

      await loadData();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save the room.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!accessToken || !roomToDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage('');

    try {
      await deleteRoom(
        roomToDelete.id,
        accessToken,
      );

      setRoomToDelete(null);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to delete the room.',
      );

      setRoomToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function clearFilters() {
    setSearchTerm('');
    setStatusFilter('ALL');
    setFloorFilter('ALL');
  }

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== 'ALL' ||
    floorFilter !== 'ALL';

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            Property management
          </p>

          <h1 className="admin-page-title">
            Room Management
          </h1>

          <p className="admin-page-description">
            Manage rooms, room types, and room availability.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
          disabled={
            !accessToken ||
            isLoading ||
            roomTypes.length === 0
          }
        >
          <span aria-hidden="true">+</span>
          Add room
        </button>
      </div>

      {roomTypes.length === 0 && !isLoading && (
        <div className="admin-alert admin-alert-warning">
          <strong>No room types available</strong>

          <p>
            Create at least one room type before adding
            a room.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="admin-alert admin-alert-error">
          <strong>Room management error</strong>

          <p>{errorMessage}</p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void loadData()}
          >
            Try again
          </button>
        </div>
      )}

      <div className="admin-content-card">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">
              All rooms
            </h2>

            <p className="admin-section-description">
              Showing {filteredRooms.length} of{' '}
              {rooms.length} rooms
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void loadData()}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="room-filters">
          <div className="room-search-field">
            <label htmlFor="room-search">
              Search rooms
            </label>

            <input
              id="room-search"
              type="search"
              className="form-input"
              placeholder="Room number or room type"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="room-filter-field">
            <label htmlFor="room-status-filter">
              Status
            </label>

            <select
              id="room-status-filter"
              className="form-input"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | 'ALL'
                    | RoomStatus,
                )
              }
            >
              <option value="ALL">
                All statuses
              </option>

              {ROOM_STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatRoomStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="room-filter-field">
            <label htmlFor="room-floor-filter">
              Floor
            </label>

            <select
              id="room-floor-filter"
              className="form-input"
              value={floorFilter}
              onChange={(event) =>
                setFloorFilter(event.target.value)
              }
            >
              <option value="ALL">
                All floors
              </option>

              {availableFloors.map((floor) => (
                <option
                  key={floor}
                  value={floor}
                >
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-ghost room-clear-filters"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {isLoading && (
          <div className="admin-empty-state">
            <span className="admin-spinner" />
            <p>Loading rooms...</p>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          filteredRooms.length === 0 && (
            <div className="admin-empty-state">
              <h3>
                {rooms.length === 0
                  ? 'No rooms found'
                  : 'No matching rooms'}
              </h3>

              <p>
                {rooms.length === 0
                  ? 'Add the first room to begin.'
                  : 'Try changing your search or filters.'}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          filteredRooms.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table room-management-table">
                <thead>
                  <tr>
                    <th>Room number</th>
                    <th>Room type</th>
                    <th>Floor</th>
                    <th>Status</th>
                    <th>Price per night</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRooms.map((room) => (
                    <tr key={room.id}>
                      <td>
                        <strong>
                          {room.roomNumber}
                        </strong>
                      </td>

                      <td>
                        <div className="room-type-cell">
                          <strong>
                            {room.roomType.name}
                          </strong>

                          {room.roomType.description && (
                            <span>
                              {room.roomType.description}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>{room.floor}</td>

                      <td>
                        <span
                          className={getRoomStatusClass(
                            room.status,
                          )}
                        >
                          {formatRoomStatus(
                            room.status,
                          )}
                        </span>
                      </td>

                      <td>
                        ETB{' '}
                        {formatPrice(
                          room.roomType.price,
                        )}
                      </td>

                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="btn btn-small btn-secondary"
                            onClick={() =>
                              openEditModal(room)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            onClick={() =>
                              setRoomToDelete(room)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {modalMode && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeFormModal();
            }
          }}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-modal-title"
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-eyebrow">
                  {modalMode === 'create'
                    ? 'New room'
                    : 'Room settings'}
                </p>

                <h2 id="room-modal-title">
                  {modalMode === 'create'
                    ? 'Add room'
                    : 'Edit room'}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                aria-label="Close modal"
                onClick={closeFormModal}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form
              className="admin-modal-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="admin-alert admin-alert-error">
                  {formError}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="room-number">
                  Room number
                </label>

                <input
                  id="room-number"
                  type="text"
                  className="form-input"
                  placeholder="Example: 101"
                  value={form.roomNumber}
                  onChange={(event) =>
                    updateFormField(
                      'roomNumber',
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="room-floor">
                  Floor
                </label>

                <input
                  id="room-floor"
                  type="number"
                  min="0"
                  step="1"
                  className="form-input"
                  placeholder="Example: 1"
                  value={form.floor}
                  onChange={(event) =>
                    updateFormField(
                      'floor',
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="room-type">
                  Room type
                </label>

                <select
                  id="room-type"
                  className="form-input"
                  value={form.roomTypeId}
                  onChange={(event) =>
                    updateFormField(
                      'roomTypeId',
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  required
                >
                  <option value="">
                    Select room type
                  </option>

                  {roomTypes.map((roomType) => (
                    <option
                      key={roomType.id}
                      value={roomType.id}
                    >
                      {roomType.name} — ETB{' '}
                      {formatPrice(roomType.price)}
                    </option>
                  ))}
                </select>
              </div>

              {modalMode === 'edit' && (
                <div className="form-field">
                  <label htmlFor="room-status">
                    Status
                  </label>

                  <select
                    id="room-status"
                    className="form-input"
                    value={form.status}
                    onChange={(event) =>
                      updateFormField(
                        'status',
                        event.target.value,
                      )
                    }
                    disabled={isSubmitting}
                    required
                  >
                    {ROOM_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatRoomStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {modalMode === 'create' && (
                <p className="room-create-note">
                  New rooms are automatically created with
                  <strong> Available </strong>
                  status.
                </p>
              )}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeFormModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : modalMode === 'create'
                      ? 'Create room'
                      : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {roomToDelete && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRoomToDelete(null);
            }
          }}
        >
          <div
            className="admin-modal admin-modal-small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-room-title"
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-eyebrow">
                  Permanent action
                </p>

                <h2 id="delete-room-title">
                  Delete room?
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                aria-label="Close delete confirmation"
                onClick={() => setRoomToDelete(null)}
                disabled={isDeleting}
              >
                ×
              </button>
            </div>

            <div className="admin-modal-content">
              <p>
                Are you sure you want to delete room{' '}
                <strong>
                  {roomToDelete.roomNumber}
                </strong>
                ?
              </p>

              <p className="admin-modal-warning">
                Rooms with booking history cannot be
                deleted.
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRoomToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting
                  ? 'Deleting...'
                  : 'Delete room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}