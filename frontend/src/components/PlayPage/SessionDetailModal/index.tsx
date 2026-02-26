import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import ConfirmDialog from "../../Dashboard/Shared/ConfirmDialog";
import { useSessionDetailModal } from "./useSessionDetailModal";
import RegisteredPlayersList from "./RegisteredPlayersList";
import WaitlistPlayersList from "./WaitlistPlayersList";
import SessionDetailActions from "./SessionDetailActions";
import RemoveGuestsModal from "./RemoveGuestsModal";
import EditGuestsModal from "./EditGuestsModal";
import WaitlistFormModal from "./WaitlistFormModal";
import type { SessionDetailModalProps } from "./types";

const SessionDetailModal: React.FC<SessionDetailModalProps> = (props) => {
  const navigate = useNavigate();
  const state = useSessionDetailModal(props);

  const {
    event,
    onClose,
    players,
    waitlistPlayers,
    playersLoading,
    waitlistLoading,
    isAlreadyRegistered,
    myGuestCount,
    myRegistrationId,
    isFull,
    showCancelConfirm,
    setShowCancelConfirm,
    showWaitlistForm,
    setShowWaitlistForm,
    waitlistForm,
    setWaitlistForm,
    waitlistSubmitting,
    waitlistMessage,
    guestCountToAdd,
    setGuestCountToAdd,
    addGuestsSubmitting,
    addGuestsMessage,
    showPartialGuestsConfirm,
    pendingGuestAdd,
    setShowPartialGuestsConfirm,
    setPendingGuestAdd,
    removeGuestsSubmitting,
    removeGuestsMessage,
    showRemoveGuestsModal,
    setShowRemoveGuestsModal,
    removeGuestsList,
    removeGuestsListLoading,
    removeGuestsSelectedIds,
    setRemoveGuestsMessage,
    myWaitlistFriendCount,
    isOnEventWaitlist,
    eventWaitlistStatusLoading,
    reduceWaitlistSubmitting,
    reduceWaitlistMessage,
    waitlistCountToReduce,
    setWaitlistCountToReduce,
    showReduceWaitlistConfirm,
    setShowReduceWaitlistConfirm,
    showEditGuestsModal,
    setShowEditGuestsModal,
    editGuestsList,
    editGuestsLoading,
    editGuestsSubmitting,
    editGuestsMessage,
    setEditGuestsList,
    showWaitlistSignInDialog,
    setShowWaitlistSignInDialog,
    handleCancelRegistration,
    openWaitlistForm,
    handleJoinWaitlist,
    handleAddGuestsClick,
    handlePartialGuestsConfirm,
    openRemoveGuestsModal,
    toggleRemoveGuestSelected,
    handleRemoveGuestsConfirm,
    handleReduceWaitlistClick,
    handleReduceWaitlistConfirm,
    openEditGuestsModal,
    handleSaveEditGuests,
  } = state;

  if (!event) return null;

  const available = event.maxCapacity - event.currentAttendees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-calibri">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto font-calibri">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 font-calibri">{event.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <FaTimes size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4 font-calibri">
          <p className="text-gray-700">
            <strong>Date:</strong>{" "}
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-700">
            <strong>Time:</strong> {event.time}
          </p>
          <p className="text-gray-700">
            <strong>Location:</strong> {event.location}
          </p>
          {event.courts && event.courts.length > 0 && (
            <p className="text-gray-700">
              <strong>Courts:</strong> {event.courts.map((c) => c.name).join(", ")}
            </p>
          )}
          <p className="text-gray-700">
            <strong>Spots:</strong> {available} available / {event.maxCapacity} total spots
          </p>
          {event.price != null && (
            <p className="text-gray-700">
              <strong>Price:</strong> ${event.price}
            </p>
          )}
          <p className="text-gray-600 text-sm font-calibri">{event.description}</p>

          <div>
            <RegisteredPlayersList players={players} loading={playersLoading} />
            <WaitlistPlayersList waitlistPlayers={waitlistPlayers} loading={waitlistLoading} />
          </div>

          {(event.status === "available" || event.status === "full") && (
            <SessionDetailActions
              event={event}
              isFull={isFull}
              isAlreadyRegistered={isAlreadyRegistered}
              myRegistrationId={myRegistrationId}
              myGuestCount={myGuestCount}
              myWaitlistFriendCount={myWaitlistFriendCount}
              eventWaitlistStatusLoading={eventWaitlistStatusLoading}
              isOnEventWaitlist={isOnEventWaitlist}
              canCancel={props.canCancel}
              isCancelling={props.isCancelling}
              isInCart={props.isInCart}
              selectedCount={props.selectedCount}
              guestCountToAdd={guestCountToAdd}
              setGuestCountToAdd={setGuestCountToAdd}
              addGuestsSubmitting={addGuestsSubmitting}
              addGuestsMessage={addGuestsMessage}
              removeGuestsSubmitting={removeGuestsSubmitting}
              removeGuestsMessage={removeGuestsMessage}
              waitlistCountToReduce={waitlistCountToReduce}
              setWaitlistCountToReduce={setWaitlistCountToReduce}
              reduceWaitlistSubmitting={reduceWaitlistSubmitting}
              reduceWaitlistMessage={reduceWaitlistMessage}
              user={state.user}
              onAddToCart={props.onAddToCart}
              onProceedToCheckout={props.onProceedToCheckout}
              onClose={onClose}
              onAddGuestsClick={handleAddGuestsClick}
              onOpenRemoveGuestsModal={openRemoveGuestsModal}
              onOpenEditGuestsModal={openEditGuestsModal}
              onReduceWaitlistClick={handleReduceWaitlistClick}
              onShowCancelConfirm={() => setShowCancelConfirm(true)}
              onOpenWaitlistForm={openWaitlistForm}
              onShowWaitlistSignInDialog={() => setShowWaitlistSignInDialog(true)}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showWaitlistSignInDialog}
        title="Sign in to continue"
        message="To join the waitlist for this session, please sign in to your account. We'll notify you by email when a spot becomes available."
        confirmLabel="Sign in"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={() => {
          setShowWaitlistSignInDialog(false);
          onClose();
          navigate("/signin", { state: { from: "/play" } });
        }}
        onCancel={() => setShowWaitlistSignInDialog(false)}
      />
      <ConfirmDialog
        open={showPartialGuestsConfirm}
        title="Partial availability"
        message={
          pendingGuestAdd
            ? pendingGuestAdd.toAdd === 0
              ? `You're adding ${pendingGuestAdd.count} friend(s). No spots are available, so all ${pendingGuestAdd.count} friend(s) will be placed on the waitlist. Payment is required for all before joining. A confirmation email will be sent after payment. Proceed to payment?`
              : `You're adding ${pendingGuestAdd.count} friend(s). Payment is required for all ${pendingGuestAdd.count} friend(s) on the payment page. Only ${pendingGuestAdd.toAdd} spot(s) are available now, so ${pendingGuestAdd.toAdd} friend(s) will secure a spot and ${pendingGuestAdd.toWaitlist} friend(s) will be placed on the waitlist. A confirmation email will be sent after payment. Proceed to payment?`
            : ""
        }
        confirmLabel="Proceed to payment"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={handlePartialGuestsConfirm}
        onCancel={() => {
          setShowPartialGuestsConfirm(false);
          setPendingGuestAdd(null);
        }}
      />
      <ConfirmDialog
        open={showReduceWaitlistConfirm}
        title="Update waitlist"
        message={
          waitlistCountToReduce >= 1 && myWaitlistFriendCount >= 1
            ? `Remove ${Math.min(waitlistCountToReduce, myWaitlistFriendCount)} friend(s) from the waitlist?`
            : ""
        }
        confirmLabel="Yes, update"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={handleReduceWaitlistConfirm}
        onCancel={() => setShowReduceWaitlistConfirm(false)}
      />
      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel registration"
        message="Are you sure you want to cancel your registration for this session? Your spot will be released for others."
        confirmLabel="Yes, cancel"
        cancelLabel="Keep registration"
        variant="danger"
        onConfirm={handleCancelRegistration}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <RemoveGuestsModal
        open={showRemoveGuestsModal}
        list={removeGuestsList}
        loading={removeGuestsListLoading}
        selectedIds={removeGuestsSelectedIds}
        submitting={removeGuestsSubmitting}
        message={removeGuestsMessage}
        onToggle={toggleRemoveGuestSelected}
        onConfirm={handleRemoveGuestsConfirm}
        onClose={() => {
          setShowRemoveGuestsModal(false);
          setRemoveGuestsMessage(null);
        }}
      />
      <EditGuestsModal
        open={showEditGuestsModal}
        list={editGuestsList}
        loading={editGuestsLoading}
        submitting={editGuestsSubmitting}
        message={editGuestsMessage}
        onListChange={setEditGuestsList}
        onSave={handleSaveEditGuests}
        onClose={() => setShowEditGuestsModal(false)}
      />
      <WaitlistFormModal
        open={showWaitlistForm}
        event={event}
        form={waitlistForm}
        user={state.user}
        submitting={waitlistSubmitting}
        message={waitlistMessage}
        onFormChange={setWaitlistForm}
        onSubmit={handleJoinWaitlist}
        onClose={() => setShowWaitlistForm(false)}
      />
    </div>
  );
};

export default SessionDetailModal;
