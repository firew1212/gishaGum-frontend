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
  createRoomType,
  deleteRoomType,
  deleteRoom,
  getAdminRoomTypes,
  getAdminRooms,
  updateRoom,
  updateRoomType,
  type Room,
  type RoomStatus,
  type RoomType,
} from '@/src/lib/admin-rooms-api';

type ModalMode = 'create' | 'edit' | null;
type RoomTypeModalMode = 'create' | 'edit' | null;

interface RoomFormState {
  roomNumber: string;
  floor: string;
  roomTypeId: string;
  status: RoomStatus;
}

interface RoomTypeFormState {
  name: string;
  description: string;
  price: string;
  amenities: string;
  images: string;
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

const EMPTY_ROOM_TYPE_FORM: RoomTypeFormState = {
  name: '',
  description: '',
  price: '',
  amenities: '',
  images: '',
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
  const [roomTypeModalMode, setRoomTypeModalMode] =
    useState<RoomTypeModalMode>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(
    null,
  );
  const [selectedRoomType, setSelectedRoomType] =
    useState<RoomType | null>(null);

  const [form, setForm] =
    useState<RoomFormState>(EMPTY_FORM);
  const [roomTypeForm, setRoomTypeForm] =
    useState<RoomTypeFormState>(EMPTY_ROOM_TYPE_FORM);

  const [roomToDelete, setRoomToDelete] =
    useState<Room | null>(null);
  const [roomTypeToDelete, setRoomTypeToDelete] =
    useState<RoomType | null>(null);
  const [roomTypeFormError, setRoomTypeFormError] =
    useState('');

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
    void loadData();
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

  function openCreateRoomTypeModal() {
    setSelectedRoomType(null);
    setRoomTypeForm(EMPTY_ROOM_TYPE_FORM);
    setRoomTypeFormError('');
    setRoomTypeModalMode('create');
  }

  function openEditRoomTypeModal(roomType: RoomType) {
    setSelectedRoomType(roomType);
    setRoomTypeForm({
      name: roomType.name,
      description: roomType.description ?? '',
      price: String(roomType.price),
      amenities: roomType.amenities.join(', '),
      images: roomType.images.join('\n'),
    });
    setRoomTypeFormError('');
    setRoomTypeModalMode('edit');
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

  function closeRoomTypeModal() {
    if (isSubmitting) {
      return;
    }

    setRoomTypeModalMode(null);
    setSelectedRoomType(null);
    setRoomTypeForm(EMPTY_ROOM_TYPE_FORM);
    setRoomTypeFormError('');
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

  function updateRoomTypeFormField(
    field: keyof RoomTypeFormState,
    value: string,
  ) {
    setRoomTypeForm((current) => ({
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

  async function handleRoomTypeSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!accessToken) {
      setRoomTypeFormError('Your session has expired. Please log in again.');
      return;
    }

    const price = Number(roomTypeForm.price);
    const amenities = roomTypeForm.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const images = roomTypeForm.images
      .split(/\r?\n|,/) 
      .map((item) => item.trim())
      .filter(Boolean);

    if (!roomTypeForm.name.trim()) {
      setRoomTypeFormError('Room type name is required.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setRoomTypeFormError('Price must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    setRoomTypeFormError('');

    try {
      const payload = {
        name: roomTypeForm.name.trim(),
        description: roomTypeForm.description.trim() || undefined,
        price,
        amenities,
        images,
      };

      if (roomTypeModalMode === 'create') {
        await createRoomType(payload, accessToken);
      } else if (selectedRoomType) {
        await updateRoomType(selectedRoomType.id, payload, accessToken);
      }

      setRoomTypeModalMode(null);
      setSelectedRoomType(null);
      setRoomTypeForm(EMPTY_ROOM_TYPE_FORM);
      setRoomTypeFormError('');
      await loadData();
    } catch (error) {
      setRoomTypeFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save the room type.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRoomTypeDelete() {
    if (!accessToken || !roomTypeToDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage('');

    try {
      await deleteRoomType(roomTypeToDelete.id, accessToken);
      setRoomTypeToDelete(null);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to delete the room type.',
      );
      setRoomTypeToDelete(null);
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
            <h2 className="admin-section-title">Room types</h2>
            <p className="admin-section-description">
              Define the public room name, price, amenities, and images used across the website.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateRoomTypeModal}
            disabled={!accessToken || isLoading}
          >
            <span aria-hidden="true">+</span>
            Add room type
          </button>
        </div>

        {!isLoading && roomTypes.length === 0 && (
          <div className="admin-empty-state">
            <p>No room types found. Add one before creating rooms.</p>
          </div>
        )}

        {roomTypes.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table room-management-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Amenities</th>
                  <th>Rooms</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td>
                      <div className="room-type-cell">
                        <strong>{roomType.name}</strong>
                        <span>{roomType.description || 'No description'}</span>
                      </div>
                    </td>
                    <td>ETB {formatPrice(roomType.price)}</td>
                    <td>{roomType.amenities.length}</td>
                    <td>{roomType.rooms?.length ?? 0}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="btn btn-small btn-secondary"
                          onClick={() => openEditRoomTypeModal(roomType)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-small btn-danger"
                          onClick={() => setRoomTypeToDelete(roomType)}
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

      {roomTypeModalMode && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRoomTypeModal();
            }
          }}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-type-modal-title"
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-eyebrow">
                  {roomTypeModalMode === 'create' ? 'New room type' : 'Room type settings'}
                </p>
                <h2 id="room-type-modal-title">
                  {roomTypeModalMode === 'create' ? 'Add room type' : 'Edit room type'}
                </h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                aria-label="Close room type modal"
                onClick={closeRoomTypeModal}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form className="admin-modal-form" onSubmit={handleRoomTypeSubmit}>
              {roomTypeFormError && (
                <div className="admin-alert admin-alert-error">
                  {roomTypeFormError}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="room-type-name">Name</label>
                <input
                  id="room-type-name"
                  className="form-input"
                  value={roomTypeForm.name}
                  onChange={(event) => updateRoomTypeFormField('name', event.target.value)}
                  placeholder="Signature Suite"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="room-type-description">Description</label>
                <textarea
                  id="room-type-description"
                  className="form-input"
                  value={roomTypeForm.description}
                  onChange={(event) => updateRoomTypeFormField('description', event.target.value)}
                  placeholder="A calm, spacious stay with views across the city."
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="room-type-price">Price per night</label>
                <input
                  id="room-type-price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={roomTypeForm.price}
                  onChange={(event) => updateRoomTypeFormField('price', event.target.value)}
                  placeholder="2500"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="room-type-amenities">Amenities</label>
                <input
                  id="room-type-amenities"
                  className="form-input"
                  value={roomTypeForm.amenities}
                  onChange={(event) => updateRoomTypeFormField('amenities', event.target.value)}
                  placeholder="WiFi, Breakfast, Ocean view"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="room-type-images">Images</label>
                <textarea
                  id="room-type-images"
                  className="form-input"
                  value={roomTypeForm.images}
                  onChange={(event) => updateRoomTypeFormField('images', event.target.value)}
                  placeholder="/images/suite.jpg or https://... (one per line)"
                  disabled={isSubmitting}
                />
                <span className="form-help-text">
                  Add one local path or image URL per line. Use files from <code>front-end/public/images</code> with paths like <code>/images/suite.jpg</code>.
                </span>
                {roomTypeForm.images.trim() && (
                  <div className="room-type-image-preview" aria-label="Room type image preview">
                    {roomTypeForm.images
                      .split(/\r?\n|,/)
                      .map((image) => image.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((image) => (
                        <img key={image} src={image} alt="Room type preview" />
                      ))}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeRoomTypeModal} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : roomTypeModalMode === 'create' ? 'Create room type' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {roomTypeToDelete && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-modal admin-modal-small" role="dialog" aria-modal="true" aria-labelledby="delete-room-type-title">
            <div className="admin-modal-header">
              <div>
                <p className="admin-eyebrow">Permanent action</p>
                <h2 id="delete-room-type-title">Delete room type?</h2>
              </div>
              <button type="button" className="admin-modal-close" aria-label="Close delete confirmation" onClick={() => setRoomTypeToDelete(null)} disabled={isDeleting}>×</button>
            </div>
            <div className="admin-modal-content">
              <p>Delete <strong>{roomTypeToDelete.name}</strong>?</p>
              <p className="admin-modal-warning">Room types with rooms assigned cannot be deleted.</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setRoomTypeToDelete(null)} disabled={isDeleting}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => void handleRoomTypeDelete()} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete room type'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}