import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectNotice,
  selectNotices,
  selectMyFavoriteNotices,
} from 'redux/notices/notices-selectors';
import { selectIsLogin } from 'redux/auth/selectors';
import { getNoticeById } from 'redux/notices/notices-operations';
import {
  addToFavorites,
  removeFromFavorites,
} from 'redux/notices/notices-operations';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import NoticeCategoryItem from 'components/NoticeCategoryItem/NoticeCategoryItem';
import s from './NoticesCategoriesList.module.scss';
import Modal from 'components/Modal/Modal';
import NoticeModal from 'components/Modal/NoticeModal/NoticeModal';
import { getDifference } from 'shared/utils/getDateFormat';
import { ModalApproveAction } from 'components/Modal/ModalApproveAction/ModalApproveAction';
import { changeFavoriteStatus } from 'redux/notices/notices-slice';
import { useEffect } from 'react';

const categoryItems = [
  { name: 'sell', value: 'sell' },
  { name: 'lost-found', value: 'lost/found' },
  { name: 'for-free', value: 'in good hands' },
];

export default function NoticesCategoriesList() {
  const dispatch = useDispatch();
  const notices = useSelector(selectNotices);
  const favoriteItem = useSelector(selectMyFavoriteNotices);
  const [showModal, setShowModal] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [idState, setId] = useState('');
  const notice = useSelector(selectNotice);
  const isLogin = useSelector(selectIsLogin);

  const handleLearnMoreBtnClick = id => {
    dispatch(getNoticeById(id));
    setId(id);
    setIsDelete(false);
    setShowModal(true);
  };

  useEffect(() => {
    dispatch(getNoticeById(idState));
  }, [favoriteItem, idState, dispatch]);

  const handleDeleteBtnClick = id => {
    setIsDelete(true);
    dispatch(getNoticeById(id));
    setShowModal(true);
  };

  const onModalClose = () => {
    setId('');
    setShowModal(false);
  };

  const handleFavoriteBtnClick = (id, favorite = false) => {
    if (!isLogin) {
      Notify.info(
        'The option "Add to favorite" is available only to registered users'
      );
    } else {
      favorite
        ? dispatch(removeFromFavorites(id)).then(() => {
            dispatch(changeFavoriteStatus({ id, status: false }));
          })
        : dispatch(addToFavorites(id)).then(() => {
            dispatch(changeFavoriteStatus({ id, status: true }));
          });
    }
  };

  const elements = notices?.map(
    ({
      _id,
      category,
      photoURL,
      title,
      location,
      birth,
      sex,
      type,
      favorite,
      own,
    }) => {
      let age = birth ? getDifference(birth) : 'no data';
      if (location.length > 5) {
        location = location.slice(0, 4) + '...';
      }
      if (age.length > 5) {
        age = age.slice(0, 4) + '...';
      }

      const categoryItem = categoryItems.find(item => item.name === category);
      category = categoryItem.value;
      return (
        <NoticeCategoryItem
          key={_id}
          id={_id}
          category={category}
          img={photoURL}
          title={title}
          place={location}
          age={age}
          sex={sex}
          kind={type}
          favorite={favorite}
          own={own}
          onLearnMoreBtnClick={handleLearnMoreBtnClick}
          onFavoriteBtnClick={handleFavoriteBtnClick}
          onDeleteBtnClick={handleDeleteBtnClick}
        />
      );
    }
  );

  return (
    <>
      <ul className={s.list}>{elements}</ul>
      {showModal && (
        <Modal className="css.noticeModal" onClose={onModalClose}>
          {isDelete ? (
            <ModalApproveAction onClose={onModalClose} {...notice} />
          ) : (
            <NoticeModal
              {...notice}
              notices={{ ...notices }}
              onFavoriteBtnClick={handleFavoriteBtnClick}
            />
          )}
        </Modal>
      )}
    </>
  );
}
