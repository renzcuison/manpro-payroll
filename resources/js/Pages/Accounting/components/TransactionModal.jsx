import * as React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

export default function TransactionModal({ open, toggleModal, data, args }) {
    return (
        <Modal isOpen={open} toggle={toggleModal} {...args} size="xl">
            <ModalHeader toggle={toggleModal}>Modal title</ModalHeader>
            <ModalBody>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
                {JSON.stringify(data)}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggleModal}>
                    Do Something
                </Button>{" "}
                <Button color="secondary" onClick={toggleModal}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}
