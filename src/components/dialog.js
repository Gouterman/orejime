import React from 'react'
import useLegacyLifecycleMethods from '../utils/useLegacyLifecycleMethods'

const ESC_KEY = 27

export default class Dialog extends React.Component {
    constructor (props) {
        super()
        this.scrollPosition = null

        // handle lifecycle methods depending on react version for full support
        if (useLegacyLifecycleMethods()) {
            this.componentWillUpdate = this.componentWillUpdateLifecycle
        } else {
            this.getSnapshotBeforeUpdate = this.getSnapshotBeforeUpdateLifecycle
        }

        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.setContentRef = this.setContentRef.bind(this)
    }

    // for react <16.3 support - see constructor
    componentWillUpdateLifecycle (nextProps) {
        const willOpen = nextProps.isOpen
        if (willOpen && !this.props.isOpen) {
            this.scrollPosition = window.pageYOffset
        }
    }

    // for react >= 16.3 support - see constructor
    getSnapshotBeforeUpdateLifecycle (prevProps) {
        const { isOpen } = this.props
        if (isOpen && !prevProps.isOpen) {
            this.scrollPosition = window.pageYOffset
        }
        return null
    }

    componentDidUpdate (prevProps, prevState) {
        const { isOpen } = this.props
        if (!isOpen && prevProps.isOpen && this.props.handleScrollPosition && this.scrollPosition !== null) {
            setTimeout(() => { // setTimeout because it seems there is a race condition of some sort without it… oh well
                window.scrollTo(window.pageXOffset, this.scrollPosition)
                this.scrollPosition = null
            }, 0)
        }

        if (
            this.props.isOpen &&
            !prevState.isOpen
        ) {
            this.content.focus()
        }
    }

    /**
     * @param {KeyboardEvent} event
     */
    handleKeyDown (event) {
        if (event.keyCode === ESC_KEY) {
            event.stopPropagation()
            this.props.onRequestClose(event)
        }
    }

    setContentRef (content) {
        this.content = content
        this.props.contentRef && this.props.contentRef(content)
    }

    render () {
        const { children, appElement, handleScrollPosition, ...reactModalProps } = this.props

        if (!reactModalProps.isOpen) return

        return <div className="orejime-ModalPortal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="orejime-modal-title"
            onKeyDown={this.handleKeyDown}
            ref={this.setContentRef}>
            <div className="ReactModal__Overlay ReactModal__Overlay--after-open orejime-ModalOverlay"
                onClick={(event) => this.props.onRequestClose(event)}/>
            <div className="ReactModal__Content ReactModal__Content--after-open orejime-ModalWrapper">
                {children}
            </div>
        </div>
    }
}

Dialog.defaultProps = {
    handleScrollPosition: true
}
