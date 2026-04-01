/**
 * @file useFormModal.js
 * @description Hook personalizado para gerir a lógica de estado e submissão de modais de formulário.
 * Centraliza as operações de abertura, fecho e a decisão entre criar um novo registo ou atualizar um existente.
 */

import { useState } from 'react';

/**
 * Hook para gestão de modais de criação/edição.
 * * @function useFormModal
 * @param {Function} addFunction - Função da store para adicionar um novo item.
 * @param {Function} updateFunction - Função da store para atualizar um item existente.
 * @param {string} token - Token de autenticação necessário para as operações de escrita.
 * @returns {Object} Objeto contendo estados e funções de controlo do modal.
 */
export default function useFormModal(addFunction, updateFunction, token) {
    /** @type {boolean} Estado que controla a visibilidade do modal. */
    const [modalAberto, setModalAberto] = useState(false);

    /** @type {Object|null} Armazena os dados do item que está a ser editado ou o esqueleto para criação. */
    const [itemEmEdicao, setItemEmEdicao] = useState(null);

    /**
     * Configura o modal para o modo de CRIAÇÃO.
     * @function abrirParaCriar
     * @param {Object} dadosIniciais - Objeto vazio com a estrutura do item (ex: {nome: '', email: ''}).
     */
    const abrirParaCriar = (dadosIniciais) => {
        setItemEmEdicao(dadosIniciais);
        setModalAberto(true);
    };

    /**
     * Configura o modal para o modo de EDIÇÃO.
     * @function abrirParaEditar
     * @param {React.MouseEvent|null} e - Evento de clique para impedir a propagação em listas.
     * @param {Object} item - O objeto do item existente que será editado.
     */
    const abrirParaEditar = (e, item) => {
        if (e) e.stopPropagation(); // Impede que o clique no botão de editar dispare eventos do contentor pai
        setItemEmEdicao(item);
        setModalAberto(true);
    };

    /**
     * Fecha o modal e limpa os dados temporários de edição.
     * @function fecharModal
     */
    const fecharModal = () => {
        setModalAberto(false);
        setItemEmEdicao(null);
    };

    /**
     * Lógica universal para guardar dados.
     * Identifica automaticamente se deve chamar a função de criação ou atualização com base na presença de um ID.
     * * @async
     * @function handleSalvar
     * @param {Object} dados - Os dados recolhidos pelo formulário do modal.
     * @returns {Promise<void>}
     */
    const handleSalvar = async (dados) => {
        let sucesso = false;

        // Se o objeto tem ID, trata-se de uma atualização; caso contrário, é uma criação
        if (dados.id) {
            sucesso = await updateFunction(token, dados.id, dados);
        } else {
            sucesso = await addFunction(token, dados);
        }

        if (sucesso) {
            fecharModal();
            alert("Operação realizada com sucesso!");
        } else {
            alert("Ocorreu um erro ao guardar os dados.");
        }
    };

    return {
        modalAberto,
        itemEmEdicao,
        abrirParaCriar,
        abrirParaEditar,
        fecharModal,
        handleSalvar
    };
}